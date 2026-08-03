import { Injectable, Inject } from '@nestjs/common';
import { Role, OrderStatus, StayStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { EventBus } from 'src/infrastructure/events/event-bus.service';
import { TokenService } from 'src/modules/auth/token.service';
import { AppConfig } from 'src/config/configuration';
import { createId } from '@paralleldrive/cuid2';
import { ConflictError, NotFoundError, ForbiddenError } from 'src/common/errors/domain.errors';
import { MenuService } from 'src/modules/menu/menu.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UpdateHousekeepingStatusDto, HousekeepingStatus } from './dto/update-housekeeping-status.dto';
import { AddChargeDto } from './dto/add-charge.dto';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { UpdateHotelSettingsDto } from './dto/update-hotel-settings.dto';
import { AdminSignUpDto } from './dto/admin-signup.dto';
import { IssueKeyDto } from './dto/issue-key.dto';

@Injectable()
export class HotelManagerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bus: EventBus,
    private readonly tokens: TokenService,
    private readonly config: AppConfig,
    @Inject(MenuService) private readonly menu: MenuService,
  ) {}

  async adminSignUp(dto: AdminSignUpDto, deviceInfo: { ip?: string; userAgent?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: this.config.argon2.memoryCost,
      timeCost: this.config.argon2.timeCost,
    });

    const userId = createId();
    const sessionId = createId();
    const hotelId = createId();

    await this.prisma.$transaction(async (tx) => {
      await tx.hotel.create({
        data: { id: hotelId, name: '' },
      });
      await tx.user.create({
        data: {
          id: userId, email: dto.email.toLowerCase(), name: dto.name,
          passwordHash, role: Role.ADMIN, hotelId,
        },
      });
      await tx.authSession.create({
        data: { id: sessionId, userId, ip: deviceInfo.ip, userAgent: deviceInfo.userAgent },
      });
    });

    const tokens = await this.tokens.issueForLogin({ userId, role: Role.STAFF, sessionId });

    return {
      tokens,
      user: { id: userId, email: dto.email.toLowerCase(), name: dto.name, role: 'ADMIN' },
      hotelId,
    };
  }

  async resolveUserHotel(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { hotelId: true } });
    if (!user?.hotelId) throw new ForbiddenError('No hotel associated with this user');
    return user.hotelId;
  }

  async getDashboard(hotelId: string, days = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [checkInsToday, checkOutsToday, activeOrders, totalLocalRooms, totalCacheRooms, occupiedRooms, todayRevenueResult] =
      await Promise.all([
        this.prisma.guestStay.count({
          where: { hotelId, checkIn: { gte: today, lt: tomorrow }, status: { in: [StayStatus.CONFIRMED, StayStatus.CHECKED_IN] } },
        }),
        this.prisma.guestStay.count({
          where: { hotelId, checkOut: { gte: today, lt: tomorrow }, status: { in: [StayStatus.CHECKED_IN, StayStatus.CHECKED_OUT] } },
        }),
        this.prisma.order.count({
          where: { stay: { hotelId }, status: { in: [OrderStatus.PENDING_REMOTE, OrderStatus.PREPARING, OrderStatus.ON_THE_WAY] } },
        }),
        this.prisma.room.count({ where: { hotelId } }),
        this.prisma.roomCache.count({ where: { hotelId } }),
        this.prisma.guestStay.count({ where: { hotelId, status: StayStatus.CHECKED_IN, selectedRoomId: { not: null } } }),
        this.prisma.order.aggregate({
          where: { stay: { hotelId }, placedAt: { gte: today, lt: tomorrow }, status: { not: OrderStatus.CANCELLED } },
          _sum: { totalCents: true },
        }),
      ]);

    const totalRooms = totalLocalRooms > 0 ? totalLocalRooms : totalCacheRooms;
    const todayRevenue = todayRevenueResult._sum.totalCents ?? 0;

    const recentOrders = await this.prisma.order.findMany({
      where: { stay: { hotelId } },
      take: 10, orderBy: { placedAt: 'desc' },
      include: { items: true, stay: { include: { user: { select: { id: true, name: true } } } } },
    });

    const revenueDays: { label: string; cents: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const day = await this.prisma.order.aggregate({
        where: { stay: { hotelId }, placedAt: { gte: d, lt: next }, status: { not: OrderStatus.CANCELLED } },
        _sum: { totalCents: true },
      });
      revenueDays.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        cents: day._sum.totalCents ?? 0,
      });
    }

    const occupancyDays: { label: string; rate: number; occupied: number; total: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const [occ, ttl] = await Promise.all([
        this.prisma.guestStay.count({ where: { hotelId, status: StayStatus.CHECKED_IN, selectedRoomId: { not: null }, checkIn: { lt: next }, checkOut: { gte: d } } }),
        Promise.resolve(totalRooms),
      ]);
      occupancyDays.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        rate: ttl > 0 ? Math.round((occ / ttl) * 100) : 0,
        occupied: occ,
        total: ttl,
      });
    }

    const yesterdayStart = new Date(today);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const [yestCheckIns, yestCheckOuts, yestRevenueResult, yestActiveOrders] = await Promise.all([
      this.prisma.guestStay.count({
        where: { hotelId, checkIn: { gte: yesterdayStart, lt: today }, status: { in: [StayStatus.CONFIRMED, StayStatus.CHECKED_IN] } },
      }),
      this.prisma.guestStay.count({
        where: { hotelId, checkOut: { gte: yesterdayStart, lt: today }, status: { in: [StayStatus.CHECKED_IN, StayStatus.CHECKED_OUT] } },
      }),
      this.prisma.order.aggregate({
        where: { stay: { hotelId }, placedAt: { gte: yesterdayStart, lt: today }, status: { not: OrderStatus.CANCELLED } },
        _sum: { totalCents: true },
      }),
      this.prisma.order.count({
        where: { stay: { hotelId }, placedAt: { gte: yesterdayStart, lt: today }, status: { in: [OrderStatus.PENDING_REMOTE, OrderStatus.PREPARING, OrderStatus.ON_THE_WAY] } },
      }),
    ]);

    const yestRevenue = yestRevenueResult._sum.totalCents ?? 0;

    const pct = (current: number, previous: number) =>
      previous > 0 ? `${Math.round(((current - previous) / previous) * 100)}%` : '+0%';

    return {
      checkInsToday, checkOutsToday, activeOrders, totalRooms, occupiedRooms,
      checkInsChange: pct(checkInsToday, yestCheckIns),
      checkOutsChange: pct(checkOutsToday, yestCheckOuts),
      revenueChange: pct(todayRevenue, yestRevenue),
      activeOrdersChange: pct(activeOrders, yestActiveOrders),
      occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      todayRevenue,
      recentOrders,
      revenue7d: revenueDays,
      occupancy7d: occupancyDays,
    };
  }

  // ── Stays ──

  async listStays(hotelId: string, status?: StayStatus, skip = 0, take = 50) {
    return this.prisma.guestStay.findMany({
      where: { hotelId, ...(status && { status }) },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { checkIn: 'desc' },
      skip,
      take,
    });
  }

  async getStay(hotelId: string, stayId: string) {
    const stay = await this.prisma.guestStay.findUnique({
      where: { id: stayId },
      include: {
        user: { select: { id: true, name: true, email: true, guestProfile: { select: { loyaltyTier: true, loyaltyPoints: true, dietaryRestrictions: true, preferredVibes: true, preferences: true } } } },
        orders: { include: { items: true }, orderBy: { placedAt: 'desc' } },
        itineraryItems: { orderBy: [{ day: 'asc' }, { startTime: 'asc' }] },
        digitalKeys: true,
        disputes: true,
      },
    });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    return stay;
  }

  async checkIn(hotelId: string, stayId: string, staffUserId: string) {
    const stay = await this.getStay(hotelId, stayId);
    if (stay.status === StayStatus.CHECKED_IN) return stay;

    let selectedRoomId = stay.selectedRoomId;
    if (!selectedRoomId) {
      const occupied = await this.prisma.guestStay.findMany({
        where: { hotelId, status: StayStatus.CHECKED_IN, selectedRoomId: { not: null } },
        select: { selectedRoomId: true },
      });
      const occupiedIds = occupied.map((s) => s.selectedRoomId!);
      const freeRoom = await this.prisma.room.findFirst({
        where: {
          hotelId,
          status: { not: 'maintenance' },
          ...(occupiedIds.length > 0 ? { id: { notIn: occupiedIds } } : {}),
        },
        orderBy: { number: 'asc' },
      });
      selectedRoomId = freeRoom?.id ?? null;
    }

    const updated = await this.prisma.guestStay.update({
      where: { id: stayId },
      data: { status: StayStatus.CHECKED_IN, selectedRoomId },
    });
    this.bus.emit('stay.checked_in', { stayId, userId: stay.userId, staffUserId });
    return updated;
  }

  async assignRoom(hotelId: string, stayId: string, roomId: string, staffUserId: string) {
    const stay = await this.getStay(hotelId, stayId);
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundError('Room not found');
    if (room.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');

    const alreadyAssigned = await this.prisma.guestStay.findFirst({
      where: { hotelId, status: StayStatus.CHECKED_IN, selectedRoomId: roomId, id: { not: stayId } },
    });
    if (alreadyAssigned) throw new ConflictError('Room is already occupied');

    const updated = await this.prisma.guestStay.update({
      where: { id: stayId },
      data: { selectedRoomId: roomId },
    });
    this.writeAuditLog(staffUserId, 'ROOM_ASSIGNED', 'guestStay', stayId, { roomId });
    return updated;
  }

  async checkOut(hotelId: string, stayId: string, staffUserId: string) {
    const stay = await this.getStay(hotelId, stayId);
    if (stay.status === StayStatus.CHECKED_OUT) return stay;
    const updated = await this.prisma.guestStay.update({
      where: { id: stayId },
      data: { status: StayStatus.CHECKED_OUT },
    });
    this.bus.emit('stay.checked_out', { stayId, userId: stay.userId, staffUserId });
    return updated;
  }

  async cancelStay(hotelId: string, stayId: string, staffUserId: string) {
    const stay = await this.getStay(hotelId, stayId);
    if (stay.status === StayStatus.CANCELLED) return stay;
    const updated = await this.prisma.guestStay.update({
      where: { id: stayId },
      data: { status: StayStatus.CANCELLED },
    });
    return updated;
  }

  // ── Orders ──

  async listOrders(hotelId: string, status?: OrderStatus, skip = 0, take = 50) {
    return this.prisma.order.findMany({
      where: { stay: { hotelId }, ...(status && { status }) },
      include: { items: true, stay: { include: { user: { select: { id: true, name: true } } } } },
      orderBy: { placedAt: 'desc' },
      skip,
      take,
    });
  }

  async updateOrderStatus(hotelId: string, orderId: string, dto: UpdateOrderStatusDto, staffUserId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { stay: true } });
    if (!order) throw new NotFoundError('Order not found');
    if (order.stay.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');

    const oldStatus = order.status;
    const updated = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.update({ where: { id: orderId }, data: { status: dto.status } });
      await tx.orderEvent.create({ data: { id: createId(), orderId, status: dto.status, source: 'staff' } });
      return o;
    });
    this.bus.emit('order.status_changed', { orderId, userId: order.userId, from: oldStatus, to: dto.status });
    return updated;
  }

  // ── Rooms ──

  async listRooms(hotelId: string) {
    const local = await this.prisma.room.findMany({ where: { hotelId } });
    if (local.length > 0) return local;
    return this.prisma.roomCache.findMany({ where: { hotelId } });
  }

  async createRoom(hotelId: string, dto: CreateRoomDto) {
    return this.prisma.room.create({
      data: { id: createId(), hotelId, ...dto },
    });
  }

  async updateRoom(hotelId: string, id: string, dto: UpdateRoomDto) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundError('Room not found');
    if (room.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    return this.prisma.room.update({ where: { id }, data: dto });
  }

  async deleteRoom(hotelId: string, id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundError('Room not found');
    if (room.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    await this.prisma.room.delete({ where: { id } });
    return { deleted: true };
  }

  // ── Housekeeping ──

  async listHousekeeping(hotelId: string, status?: string) {
    const where = status ? { hotelId, snapshot: { path: ['status'], equals: status } as any } : { hotelId };
    return this.prisma.housekeepingTaskCache.findMany({ where: where as any });
  }

  async updateHousekeepingStatus(hotelId: string, id: string, dto: UpdateHousekeepingStatusDto) {
    const task = await this.prisma.housekeepingTaskCache.findUnique({ where: { externalId: id } });
    if (!task) throw new NotFoundError('Housekeeping task not found');
    const snapshot = task.snapshot as Record<string, any>;
    return this.prisma.housekeepingTaskCache.update({
      where: { externalId: id },
      data: {
        snapshot: {
          ...snapshot,
          status: dto.status,
          notes: dto.notes ?? snapshot.notes,
          assignedTo: dto.assignedTo ?? snapshot.assignedTo,
        },
      },
    });
  }

  // ── Folio / Billing / Invoices ──

  async listInvoices(hotelId: string) {
    const [invoiceRecords, stays] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { hotelId },
        include: { stay: { include: { user: { select: { name: true, email: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.guestStay.findMany({
        where: { hotelId, status: StayStatus.CHECKED_OUT },
        include: {
          user: { select: { name: true, email: true } },
          orders: { select: { totalCents: true } },
        },
        orderBy: { checkOut: 'desc' },
        take: 50,
      }),
    ]);

    const generatedInvoiceIds = new Set(invoiceRecords.map((inv) => inv.guestStayId));
    const staysWithoutInvoice = stays
      .filter((s) => !generatedInvoiceIds.has(s.id))
      .map((s) => ({
        id: s.id,
        guestName: s.user?.name || 'Unknown',
        guestEmail: s.user?.email,
        checkIn: s.checkIn,
        checkOut: s.checkOut,
        totalCents: s.orders.reduce((sum, o) => sum + (o.totalCents || 0), 0),
        roomNumber: s.selectedRoomId || '?',
        status: 'UNINVOICED' as const,
        invoiceNumber: null,
        createdAt: s.checkOut,
      }));

    const mappedInvoices = invoiceRecords.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      guestName: inv.stay.user?.name || 'Unknown',
      guestEmail: inv.stay.user?.email,
      checkIn: inv.stay.checkIn,
      checkOut: inv.stay.checkOut,
      totalCents: inv.totalCents,
      roomNumber: inv.stay.selectedRoomId || '?',
      status: inv.status,
      createdAt: inv.createdAt,
    }));

    return [...mappedInvoices, ...staysWithoutInvoice];
  }

  async generateInvoice(hotelId: string, stayId: string, staffUserId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');

    const existing = await this.prisma.invoice.findFirst({ where: { guestStayId: stayId } });
    if (existing) throw new ConflictError('Invoice already exists for this stay');

    let folioLines: any[] = [];
    let totalCents = 0;
    let currency = 'USD';

    if (stay.externalReservationId) {
      const folio = await this.prisma.folioCache.findUnique({
        where: { externalReservationId: stay.externalReservationId },
      });
      if (folio) {
        const snapshot = folio.snapshot as Record<string, any>;
        folioLines = snapshot.lines ?? [];
        totalCents = folio.totalCents ?? 0;
        currency = folio.currency ?? 'USD';
      }
    }

    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { hotelId },
      orderBy: { invoiceNumber: 'desc' },
    });

    const lastNum = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber.replace('INV-', ''), 10)
      : 0;
    const invoiceNumber = `INV-${String(lastNum + 1).padStart(4, '0')}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        id: createId(),
        hotelId,
        guestStayId: stayId,
        invoiceNumber,
        status: 'DRAFT' as any,
        totalCents,
        currency,
        folioSnapshot: { lines: folioLines, totalCents, currency },
        issuedAt: new Date(),
        createdAt: new Date(),
      },
    });

    await this.writeAuditLog(staffUserId, 'INVOICE_GENERATED', 'invoice', invoice.id, {
      stayId,
      invoiceNumber,
      totalCents,
    });

    return invoice;
  }

  async updateInvoiceStatus(hotelId: string, invoiceId: string, status: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { stay: true },
    });
    if (!invoice) throw new NotFoundError('Invoice not found');
    if (invoice.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');

    const updateData: Record<string, any> = { status: status as any };
    if (status === 'PAID') updateData.paidAt = new Date();
    if (status === 'VOID' || status === 'CANCELLED') updateData.cancelledAt = new Date();

    return this.prisma.invoice.update({ where: { id: invoiceId }, data: updateData });
  }

  async getFolio(hotelId: string, stayId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');

    if (!stay.externalReservationId) {
      return { lines: [], totalCents: 0, currency: 'USD', finalized: false };
    }
    const folio = await this.prisma.folioCache.findUnique({
      where: { externalReservationId: stay.externalReservationId },
    });
    return folio ?? { lines: [], totalCents: 0, currency: 'USD', finalized: false };
  }

  async addCharge(hotelId: string, stayId: string, dto: AddChargeDto, staffUserId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');

    const charge = {
      id: `manual-${createId().slice(0, 8)}`,
      description: dto.description,
      amountCents: dto.amountCents,
      category: dto.category ?? 'ROOM_SERVICE',
      date: new Date().toISOString(),
      addedBy: staffUserId,
    };

    const existing = await this.prisma.folioCache.findUnique({
      where: { externalReservationId: stay.externalReservationId ?? 'none' },
    });
    let result: any;
    if (existing) {
      const snapshot = existing.snapshot as Record<string, any>;
      const lines = [...(snapshot.lines ?? []), charge];
      result = await this.prisma.folioCache.update({
        where: { externalReservationId: stay.externalReservationId! },
        data: { snapshot: { ...snapshot, lines }, totalCents: existing.totalCents + dto.amountCents },
      });
    } else {
      result = charge;
    }

    await this.writeAuditLog(staffUserId, 'CHARGE_ADDED', 'folio', stayId, { amountCents: dto.amountCents, description: dto.description });
    return result;
  }

  async recordPayment(hotelId: string, stayId: string, dto: { amountCents: number; method: string; notes?: string; invoiceId?: string; currency?: string }, staffUserId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');

    const payment = await this.prisma.paymentIntent.create({
      data: {
        id: createId(),
        userId: stay.userId,
        guestStayId: stayId,
        amountCents: dto.amountCents,
        currency: dto.currency ?? 'USD',
        status: 'CAPTURED' as any,
        providerIntentId: `manual-${createId().slice(0, 12)}`,
        metadata: { recordedBy: staffUserId, method: dto.method, notes: dto.notes ?? null },
      },
    });

    if (dto.invoiceId) {
      await this.prisma.invoice.update({
        where: { id: dto.invoiceId },
        data: { status: 'PAID' as any, paidAt: new Date() },
      });
    }

    await this.writeAuditLog(staffUserId, 'PAYMENT_RECORDED', 'payment', payment.id, {
      stayId, amountCents: dto.amountCents, method: dto.method,
    });

    return payment;
  }

  async voidCharge(hotelId: string, stayId: string, chargeId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    if (!stay.externalReservationId) throw new NotFoundError('No folio for this stay');

    const existing = await this.prisma.folioCache.findUnique({
      where: { externalReservationId: stay.externalReservationId },
    });
    if (!existing) throw new NotFoundError('Folio not found');

    const snapshot = existing.snapshot as Record<string, any>;
    const lines = snapshot.lines ?? [];
    const idx = lines.findIndex((l: any) => l.id === chargeId);
    if (idx === -1) throw new NotFoundError('Charge not found in folio');

    const removed = lines.splice(idx, 1)[0];
    const result = await this.prisma.folioCache.update({
      where: { externalReservationId: stay.externalReservationId },
      data: {
        snapshot: { ...snapshot, lines },
        totalCents: existing.totalCents - (removed.amountCents ?? 0),
      },
    });
    return result;
  }

  // ── Audit Logs ──

  async listAuditLogs(hotelId: string, limit = 100) {
    const userIds = await this.prisma.user.findMany({
      where: { hotelId },
      select: { id: true },
    });
    const ids = userIds.map((u) => u.id);
    if (ids.length === 0) return [];
    return this.prisma.auditLog.findMany({
      where: { actorUserId: { in: ids } },
      include: { actor: { select: { id: true, name: true, email: true } } },
      orderBy: { occurredAt: 'desc' },
      take: limit,
    });
  }

  async writeAuditLog(
    actorUserId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    payload?: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        id: createId(),
        actorUserId,
        action,
        resourceType,
        resourceId,
        payload: payload ?? undefined,
        ip,
        userAgent,
        occurredAt: new Date(),
      },
    });
  }

  // ── Disputes ──

  async listDisputes(hotelId: string) {
    return this.prisma.dispute.findMany({
      where: { stay: { hotelId } },
      include: { stay: { include: { user: { select: { id: true, name: true, email: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveDispute(hotelId: string, disputeId: string, resolution: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { stay: true },
    });
    if (!dispute) throw new NotFoundError('Dispute not found');
    if (dispute.stay.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status: 'RESOLVED' as any, resolution, resolvedAt: new Date() },
    });
  }

  async rejectDispute(hotelId: string, disputeId: string, resolution: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { stay: true },
    });
    if (!dispute) throw new NotFoundError('Dispute not found');
    if (dispute.stay.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status: 'REJECTED' as any, resolution, resolvedAt: new Date() },
    });
  }

  // ── Itinerary ──

  async listItinerary(hotelId: string, stayId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    return this.prisma.itineraryItem.findMany({
      where: { guestStayId: stayId },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
  }

  // ── Digital Keys ──

  async listDigitalKeys(hotelId: string) {
    return this.prisma.digitalKey.findMany({
      where: { stay: { hotelId } },
      include: { stay: { include: { user: { select: { id: true, name: true } } } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async revokeDigitalKey(hotelId: string, id: string) {
    const key = await this.prisma.digitalKey.findUnique({ where: { id }, include: { stay: true } });
    if (!key) throw new NotFoundError('Digital key not found');
    if (key.stay.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    return this.prisma.digitalKey.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  async issueDigitalKey(hotelId: string, dto: IssueKeyDto) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: dto.stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    return this.prisma.digitalKey.create({
      data: {
        id: createId(),
        guestStayId: dto.stayId,
        externalRoomId: dto.externalRoomId,
        expiresAt: new Date(dto.expiresAt),
        pinHash: dto.pin ? await argon2.hash(dto.pin, { type: argon2.argon2id }) : null,
      },
    });
  }

  // ── Amenities ──

  async listAmenities(hotelId: string) {
    return this.prisma.amenity.findMany({ where: { hotelId }, orderBy: { name: 'asc' } });
  }

  async createAmenity(hotelId: string, dto: CreateAmenityDto) {
    return this.prisma.amenity.create({
      data: { id: createId(), hotelId, isAvailable: true, ...dto },
    });
  }

  async updateAmenity(hotelId: string, id: string, dto: UpdateAmenityDto) {
    const amenity = await this.prisma.amenity.findUnique({ where: { id } });
    if (!amenity) throw new NotFoundError('Amenity not found');
    if (amenity.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    return this.prisma.amenity.update({ where: { id }, data: dto });
  }

  async deleteAmenity(hotelId: string, id: string) {
    const amenity = await this.prisma.amenity.findUnique({ where: { id } });
    if (!amenity) throw new NotFoundError('Amenity not found');
    if (amenity.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    await this.prisma.amenity.delete({ where: { id } });
    return { deleted: true };
  }

  // ── Hotel Settings ──

  async getHotelSettings(hotelId: string) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return {
        id: hotelId, name: 'Demo Hotel', address: '123 Main St', description: '',
        phone: '+1-555-0100', email: 'info@demohotel.com',
        checkInTime: '14:00', checkOutTime: '11:00', currency: 'USD',
        timezone: 'UTC', cancellationPolicy: null, socialLinks: null, imageUrl: null,
      };
    }
    return hotel;
  }

  async updateHotelSettings(hotelId: string, dto: UpdateHotelSettingsDto) {
    const existing = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (existing) {
      return this.prisma.hotel.update({ where: { id: hotelId }, data: dto });
    }
    return this.prisma.hotel.create({
      data: { id: hotelId, name: dto.name ?? 'Demo Hotel', ...dto },
    });
  }

  // ── Staff Management ──

  async listStaff(hotelId: string) {
    return this.prisma.user.findMany({
      where: { hotelId, role: { in: [Role.ADMIN, Role.STAFF, Role.CONCIERGE] } },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async inviteStaff(hotelId: string, dto: AdminSignUpDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictError('Email already in use');

    const userId = createId();
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: this.config.argon2.memoryCost,
      timeCost: this.config.argon2.timeCost,
    });

    return this.prisma.user.create({
      data: {
        id: userId, email: dto.email.toLowerCase(), name: dto.name,
        passwordHash, role: Role.STAFF, hotelId,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async updateStaffRole(hotelId: string, staffId: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id: staffId } });
    if (!user) throw new NotFoundError('Staff not found');
    if (user.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    return this.prisma.user.update({
      where: { id: staffId },
      data: { role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async removeStaff(hotelId: string, staffId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: staffId } });
    if (!user) throw new NotFoundError('Staff not found');
    if (user.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    if (user.role === Role.ADMIN) throw new ForbiddenError('Cannot remove an admin');
    await this.prisma.user.update({
      where: { id: staffId },
      data: { hotelId: null, role: Role.GUEST },
    });
    return { removed: true };
  }

  // ── Feature Flags ──

  async listFeatureFlags() {
    return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  async updateFeatureFlag(key: string, data: { enabled?: boolean; rolloutPercent?: number }) {
    const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) throw new NotFoundError('Feature flag not found');
    return this.prisma.featureFlag.update({ where: { key }, data });
  }

  // ── Menu CRUD ──

  async listMenuItems(hotelId: string, category?: string) {
    return this.menu.list(hotelId, category as any);
  }

  async createMenuItem(hotelId: string, dto: CreateMenuItemDto) {
    return this.prisma.menuItem.create({
      data: { id: createId(), hotelId, ...dto },
    });
  }

  async updateMenuItem(hotelId: string, id: string, dto: UpdateMenuItemDto) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundError('Menu item not found');
    if (item.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    return this.prisma.menuItem.update({ where: { id }, data: dto });
  }

  async deleteMenuItem(hotelId: string, id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundError('Menu item not found');
    if (item.hotelId !== hotelId) throw new ForbiddenError('Not your hotel');
    await this.prisma.menuItem.delete({ where: { id } });
    return { deleted: true };
  }

  // ── Bulk Housekeeping ──

  async bulkHousekeepingStatus(ids: string[], status: string, assignedTo?: string) {
    const tasks = await this.prisma.housekeepingTaskCache.findMany({
      where: { externalId: { in: ids } },
    });
    const updated = await this.prisma.$transaction(
      tasks.map((task) => {
        const snapshot = task.snapshot as Record<string, any>;
        return this.prisma.housekeepingTaskCache.update({
          where: { externalId: task.externalId },
          data: { snapshot: { ...snapshot, status, assignedTo: assignedTo ?? snapshot.assignedTo } },
        });
      }),
    );
    return { updated: updated.length };
  }
}
