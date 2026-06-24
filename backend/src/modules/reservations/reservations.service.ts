import { Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RESERVATION_PROVIDER } from 'src/hospitality/tokens';
import { ReservationProvider } from 'src/hospitality/domain/providers/reservation.provider';
import { ConflictError, ForbiddenError, NotFoundError } from 'src/common/errors/domain.errors';
import { CreateStayDto } from './dto/create-stay.dto';

/**
 * Reads merge our local GuestStay (which carries onboarding state) with
 * the upstream Reservation (status, total, room assignment).
 */
@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(RESERVATION_PROVIDER) private readonly reservations: ReservationProvider,
  ) {}

  /**
   * Create a draft stay from the guest-info onboarding flow.
   * The upstream HMS reservation is provisioned lazily on check-in.
   */
  async createStay(userId: string, dto: CreateStayDto) {
    return this.prisma.guestStay.create({
      data: {
        id: createId(),
        userId,
        hotelId: dto.hotelId ?? 'demo-hotel',
        status: 'PENDING',
        checkIn: new Date(dto.checkIn),
        checkOut: new Date(dto.checkOut),
        nights: dto.nights,
        adults: dto.adults,
        children: dto.children,
        roomPreference: dto.roomPreference,
        bedPreference: dto.bedPreference,
        floorPreference: dto.floorPreference,
        mealPlan: dto.mealPlan,
        specialRequests: dto.specialRequests,
        itineraryVibes: dto.itineraryVibes ?? [],
        dietaryRestrictions: dto.dietaryRestrictions ?? [],
      },
    });
  }

  async listMine(userId: string, skip = 0, take = 20) {
    const stays = await this.prisma.guestStay.findMany({
      where: { userId },
      orderBy: { checkIn: 'desc' },
      skip,
      take,
    });
    // For each stay, attempt to fetch live status. Failures degrade gracefully:
    // the local stay row still has check-in/out and onboarding flags.
    return Promise.all(
      stays.map(async (stay) => {
        if (!stay.externalReservationId) {
          return { ...stay, _meta: { source: 'local-only' as const } };
        }
        const r = await this.reservations.getReservation(stay.externalReservationId);
        if (!r.ok) return { ...stay, _meta: { source: 'cache' as const, degraded: true } };
        return {
          ...stay,
          remoteStatus: r.data.status,
          remoteRoom: r.data.roomExternalId,
          _meta: { source: r.source },
        };
      }),
    );
  }

  async getMine(userId: string, stayId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');
    if (!stay.externalReservationId) return { ...stay, _meta: { source: 'local-only' } };
    const r = await this.reservations.getReservation(stay.externalReservationId);
    if (!r.ok) return { ...stay, _meta: { source: 'cache', degraded: true } };
    return { ...stay, remote: r.data, _meta: { source: r.source } };
  }

  async linkReservation(userId: string, confirmationNumber: string, email?: string, phone?: string) {
    const r = await this.reservations.getReservation(confirmationNumber);
    if (!r.ok) throw new NotFoundError('Reservation not found for this confirmation number');

    const existing = await this.prisma.guestStay.findFirst({
      where: { externalReservationId: confirmationNumber },
    });
    if (existing) {
      if (existing.userId !== userId) throw new ConflictError('This reservation is linked to another account');
      return existing;
    }

    return this.prisma.guestStay.create({
      data: {
        id: createId(),
        userId,
        hotelId: 'demo-hotel',
        externalReservationId: confirmationNumber,
        status: r.data.status as any,
        checkIn: r.data.checkIn instanceof Date ? r.data.checkIn : new Date(r.data.checkIn),
        checkOut: r.data.checkOut instanceof Date ? r.data.checkOut : new Date(r.data.checkOut),
        nights: r.data.nights ?? 1,
        adults: r.data.adults ?? 1,
        children: r.data.children ?? 0,
      },
    });
  }

  async checkIn(userId: string, stayId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');
    if (!stay.externalReservationId) {
      // First check-in needs an upstream reservation — provision lazily.
      const created = await this.reservations.createReservation({
        guestExternalId: userId, // in real life: a mapped HMS guest id
        hotelId: stay.hotelId ?? 'demo-hotel',
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        adults: stay.adults,
        children: stay.children,
        roomPreference: stay.roomPreference ?? undefined,
      });
      if (!created.ok) {
        throw new Error(`Could not provision reservation: ${created.reason}`);
      }
      await this.prisma.guestStay.update({
        where: { id: stayId },
        data: { externalReservationId: created.data.externalId },
      });
      stay.externalReservationId = created.data.externalId;
    }
    const result = await this.reservations.checkIn(stay.externalReservationId);
    if (!result.ok) throw new Error(`Check-in failed: ${result.reason}`);

    let selectedRoomId = stay.selectedRoomId;
    if (!selectedRoomId && stay.hotelId) {
      const occupied = await this.prisma.guestStay.findMany({
        where: { hotelId: stay.hotelId, status: 'CHECKED_IN' as any, selectedRoomId: { not: null } },
        select: { selectedRoomId: true },
      });
      const occupiedIds = occupied.map((s) => s.selectedRoomId!);
      const freeRoom = await this.prisma.room.findFirst({
        where: {
          hotelId: stay.hotelId,
          status: { not: 'maintenance' },
          ...(occupiedIds.length > 0 ? { id: { notIn: occupiedIds } } : {}),
        },
        orderBy: { number: 'asc' },
      });
      selectedRoomId = freeRoom?.id ?? null;
    }

    await this.prisma.guestStay.update({
      where: { id: stayId },
      data: { status: 'CHECKED_IN', onboardingCompleted: true, selectedRoomId },
    });
    return result.data;
  }

  async cancel(userId: string, stayId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');
    if (stay.status === 'CHECKED_OUT' || stay.status === 'CANCELLED') {
      throw new ConflictError('Stay cannot be cancelled');
    }
    if (stay.externalReservationId) {
      await this.reservations.cancelReservation(stay.externalReservationId, 'Guest cancelled');
    }
    return this.prisma.guestStay.update({
      where: { id: stayId },
      data: { status: 'CANCELLED' },
    });
  }
}
