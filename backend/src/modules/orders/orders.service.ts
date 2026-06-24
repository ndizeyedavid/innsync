import { Inject, Injectable, Logger } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { OutboxService } from 'src/infrastructure/outbox/outbox.service';
import { EventBus } from 'src/infrastructure/events/event-bus.service';
import { ROOM_SERVICE_PROVIDER } from 'src/hospitality/tokens';
import { RoomServiceProvider } from 'src/hospitality/domain/providers/room-service.provider';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from 'src/common/errors/domain.errors';
import { orderTransitions } from 'src/infrastructure/observability/metrics.controller';
import { MenuService } from 'src/modules/menu/menu.service';
import { PlaceOrderDto } from './dto/place-order.dto';

/**
 * The orders use-case service.
 *
 * Responsibilities:
 *   1. Validate the cart against menu data (price snapshots, prep times).
 *   2. Write a local Order row + outbox event in one transaction. This is
 *      the durability guarantee — even if the HMS is down, the order is
 *      not lost.
 *   3. Return immediately. The outbox publisher will dispatch to the HMS
 *      and call updateExternalLink() once the upstream ticket exists.
 *   4. Subscribe to upstream status updates and emit `order.status_changed`
 *      domain events; the gateway picks those up and notifies clients.
 *
 * Importantly, the controller never imports the RoomServiceProvider — only
 * this service does, through the token. Tests can swap in a fake provider
 * without touching HTTP code.
 */
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly events: EventBus,
    private readonly menu: MenuService,
    @Inject(ROOM_SERVICE_PROVIDER) private readonly roomService: RoomServiceProvider,
  ) {}

  async placeOrder(userId: string, dto: PlaceOrderDto, idempotencyKey: string) {
    if (!idempotencyKey) throw new ValidationError('Missing idempotency key');

    const stay = await this.prisma.guestStay.findUnique({
      where: { id: dto.stayId },
      select: { id: true, userId: true, externalReservationId: true, status: true },
    });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');
    if (stay.status !== 'CHECKED_IN' && stay.status !== 'CONFIRMED') {
      throw new ConflictError(`Cannot order while stay is ${stay.status}`);
    }
    // Resolve menu items server-side. Never trust client prices.
    const menuItems = await this.menu.getMany(dto.items.map((i) => i.externalMenuItemId));
    const items = dto.items.map((i, idx) => {
      const m = menuItems[idx]!;
      return {
        id: createId(),
        externalMenuItemId: m.id,
        nameSnapshot: m.name,
        quantity: i.quantity,
        unitPriceCents: m.priceCents,
        note: i.note,
        prepMinutes: m.prepMinutes,
      };
    });
    if (items.some((i) => i.unitPriceCents < 0)) {
      throw new ValidationError('Invalid item price');
    }
    const totalCents = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);

    // Local-first write inside a transaction, outbox row included.
    const order = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          id: createId(),
          guestStayId: stay.id,
          userId,
          idempotencyKey,
          status: OrderStatus.PENDING_REMOTE,
          category: dto.category,
          totalCents,
          currency: 'USD',
          items: { create: items },
        },
        include: { items: true },
      });

      if (stay.externalReservationId) {
        await this.outbox.write(tx, {
          aggregateId: o.id,
          aggregateType: 'Order',
          eventType: 'order.dispatch_to_hms',
          payload: {
            orderId: o.id,
            externalReservationId: stay.externalReservationId,
            items: o.items.map((i) => ({
              externalMenuItemId: i.externalMenuItemId,
              nameSnapshot: i.nameSnapshot,
              quantity: i.quantity,
              unitPriceCents: i.unitPriceCents,
              note: i.note ?? null,
            })),
            notes: dto.notes ?? null,
            idempotencyKey: o.idempotencyKey,
          },
        });
      }

      return o;
    });

    this.events.emit('order.placed', {
      orderId: order.id,
      userId,
      guestStayId: order.guestStayId,
      totalCents: order.totalCents,
      currency: order.currency,
    });

    return order;
  }

  /**
   * Outbox handler entry. Called by the publisher when an `order.dispatch_to_hms`
   * event is ready to process. Calls the provider, updates linkage, and
   * subscribes for live status updates.
   */
  async dispatchToHms(payload: {
    orderId: string;
    externalReservationId: string;
    items: { externalMenuItemId: string; nameSnapshot: string; quantity: number; unitPriceCents: number; note: string | null }[];
    notes: string | null;
    idempotencyKey: string;
  }): Promise<void> {
    const result = await this.roomService.createTicket({
      externalReservationId: payload.externalReservationId,
      items: payload.items.map((i) => ({
        externalMenuItemId: i.externalMenuItemId,
        nameSnapshot: i.nameSnapshot,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
        note: i.note ?? undefined,
      })),
      notes: payload.notes ?? undefined,
      idempotencyKey: payload.idempotencyKey,
    });
    if (!result.ok) {
      // The outbox publisher will retry with backoff. After max attempts it
      // moves to the poison queue; an alert page wakes oncall.
      throw new Error(`createTicket failed: ${result.reason}`);
    }

    const ticket = result.data;
    await this.prisma.order.update({
      where: { id: payload.orderId },
      data: {
        status: OrderStatus.PREPARING,
        externalTicketId: ticket.externalId,
        etaMinutes: ticket.etaMinutes,
        lastSyncedAt: new Date(),
      },
    });

    orderTransitions.inc({ from: 'PENDING_REMOTE', to: 'PREPARING' });

    const order = await this.prisma.order.findUnique({
      where: { id: payload.orderId },
      select: { userId: true },
    });
    if (!order) return;
    this.events.emit('order.status_changed', {
      orderId: payload.orderId,
      userId: order.userId,
      from: 'PENDING_REMOTE',
      to: 'PREPARING',
      etaMinutes: ticket.etaMinutes,
    });

    // Subscribe to subsequent transitions if the provider supports it.
    if (this.roomService.subscribeStatus) {
      await this.roomService.subscribeStatus(ticket.externalId, async (status, t) => {
        await this.applyExternalStatus(payload.orderId, status, t.etaMinutes, t.deliveredAt ?? null);
      });
    }
  }

  /**
   * Apply an external status delta to a local order. Idempotent: if the
   * order is already in that status, no-op.
   */
  async applyExternalStatus(
    orderId: string,
    extStatus: string,
    etaMinutes: number,
    deliveredAt: Date | null,
  ): Promise<void> {
    const status = mapExternalStatus(extStatus);
    if (!status) return;
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, userId: true, totalCents: true },
    });
    if (!order || order.status === status) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          etaMinutes,
          deliveredAt: deliveredAt ?? undefined,
          lastSyncedAt: new Date(),
        },
      });
      await tx.orderEvent.create({
        data: { id: createId(), orderId, status, source: 'hms' },
      });
    });

    orderTransitions.inc({ from: order.status, to: status });
    this.events.emit('order.status_changed', {
      orderId,
      userId: order.userId,
      from: order.status,
      to: status,
      etaMinutes,
    });

    if (status === OrderStatus.DELIVERED) {
      this.events.emit('order.completed', {
        orderId,
        userId: order.userId,
        totalCents: order.totalCents,
      });
    }
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundError('Order not found');
    if (order.userId !== userId) throw new ForbiddenError('Not your order');
    return order;
  }

  async listMine(userId: string, opts: { active?: boolean; limit: number }) {
    const where: Prisma.OrderWhereInput = { userId };
    if (opts.active) where.status = { in: ['PENDING_REMOTE', 'PREPARING', 'ON_THE_WAY'] };
    return this.prisma.order.findMany({
      where,
      orderBy: { placedAt: 'desc' },
      take: opts.limit,
      include: { items: true },
    });
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError('Order not found');
    if (order.userId !== userId) throw new ForbiddenError('Not your order');
    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new ConflictError('Order cannot be cancelled');
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
  }
}

function mapExternalStatus(s: string): OrderStatus | null {
  switch (s) {
    case 'queued':
    case 'preparing':
      return OrderStatus.PREPARING;
    case 'on_the_way':
      return OrderStatus.ON_THE_WAY;
    case 'delivered':
      return OrderStatus.DELIVERED;
    case 'cancelled':
      return OrderStatus.CANCELLED;
    case 'failed':
      return OrderStatus.FAILED;
    default:
      return null;
  }
}
