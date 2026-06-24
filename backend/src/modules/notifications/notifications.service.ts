import { Injectable, Logger } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { NotificationChannel, NotificationKind, Prisma } from '@prisma/client';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { EventBus } from 'src/infrastructure/events/event-bus.service';
import {
  OrderStatusChangedPayload,
  CheckoutCompletedPayload,
  StayCheckedInPayload,
  StayCheckedOutPayload,
} from 'src/infrastructure/events/domain-events';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventBus,
  ) {}

  async create(input: {
    userId: string;
    channel?: NotificationChannel;
    kind: NotificationKind;
    title: string;
    body?: string;
    payload?: Prisma.InputJsonValue;
  }) {
    const n = await this.prisma.notification.create({
      data: {
        id: createId(),
        userId: input.userId,
        channel: input.channel ?? NotificationChannel.IN_APP,
        kind: input.kind,
        title: input.title,
        body: input.body,
        payload: input.payload,
      },
    });
    this.events.emit('notification.created', {
      notificationId: n.id,
      userId: n.userId,
      channel: n.channel,
    });
    return n;
  }

  async listMine(userId: string, limit = 30, skip = 0) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  // ─── Event handlers that turn domain events into notifications ──

  @OnEvent('order.status_changed')
  async onOrderStatus(payload: OrderStatusChangedPayload) {
    if (payload.to === 'ON_THE_WAY') {
      await this.create({
        userId: payload.userId,
        kind: NotificationKind.INFO,
        title: 'On the way',
        body: `Your order is heading to your room${payload.etaMinutes ? ` — ${payload.etaMinutes} min` : ''}.`,
        payload: { orderId: payload.orderId } as Prisma.InputJsonValue,
      });
    } else if (payload.to === 'DELIVERED') {
      await this.create({
        userId: payload.userId,
        kind: NotificationKind.SUCCESS,
        title: 'Delivered',
        body: 'Enjoy! Tap to leave a quick rating.',
        payload: { orderId: payload.orderId } as Prisma.InputJsonValue,
      });
    }
  }

  @OnEvent('checkout.completed')
  async onCheckout(payload: CheckoutCompletedPayload) {
    await this.create({
      userId: payload.userId,
      kind: NotificationKind.SUCCESS,
      title: 'Check-out complete',
      body: 'A receipt has been emailed to you. See you next time!',
    });
  }

  @OnEvent('stay.checked_in')
  async onStayCheckedIn(payload: StayCheckedInPayload) {
    await this.create({
      userId: payload.userId,
      kind: NotificationKind.SUCCESS,
      title: 'Welcome!',
      body: 'You are checked in. Enjoy your stay!',
      payload: { stayId: payload.stayId } as Prisma.InputJsonValue,
    });
  }

  @OnEvent('stay.checked_out')
  async onStayCheckedOut(payload: StayCheckedOutPayload) {
    await this.create({
      userId: payload.userId,
      kind: NotificationKind.INFO,
      title: 'Checked out',
      body: 'You have been checked out. Thank you for staying with us!',
      payload: { stayId: payload.stayId } as Prisma.InputJsonValue,
    });
  }
}
