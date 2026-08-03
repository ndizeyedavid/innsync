import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { EventBus } from 'src/infrastructure/events/event-bus.service';
import { RESERVATION_PROVIDER } from '../tokens';
import { ReservationProvider } from '../domain/providers/reservation.provider';
import { Reservation } from '../domain/models/reservation.model';

/**
 * Periodically reconciles cached reservations with the upstream truth.
 *
 *   - Iterates active stays only (between check-in and check-out).
 *   - For each, fetches the live reservation. If status or room differs,
 *     emits `reservation.drift_detected` so downstream listeners (loyalty,
 *     notifications) can react.
 *
 * Designed to be idempotent: a clean run is a no-op.
 */
@Injectable()
export class ReservationReconciler {
  private readonly logger = new Logger(ReservationReconciler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventBus,
    @Inject(RESERVATION_PROVIDER) private readonly reservations: ReservationProvider,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async reconcileActive(): Promise<void> {
    const stays = await this.prisma.guestStay.findMany({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        externalReservationId: { not: null },
      },
      select: { id: true, userId: true, externalReservationId: true },
      take: 200,
    });

    for (const stay of stays) {
      if (!stay.externalReservationId) continue;
      const r = await this.reservations.getReservation(stay.externalReservationId);
      if (!r.ok) continue;
      await this.detectDrift(stay.id, stay.externalReservationId, r.data);
    }
  }

  private async detectDrift(stayId: string, externalId: string, live: Reservation): Promise<void> {
    const cached = await this.prisma.reservationCache.findUnique({ where: { externalId } });
    if (!cached) return;
    const prev = cached.snapshot as unknown as Reservation;
    const drifted: string[] = [];
    if (prev.status !== live.status) drifted.push('status');
    if (prev.roomExternalId !== live.roomExternalId) drifted.push('roomExternalId');
    if (prev.totalCents !== live.totalCents) drifted.push('totalCents');
    if (drifted.length === 0) return;
    this.logger.warn({ stayId, externalId, drifted }, 'reservation drift detected');
    this.events.emit('reservation.drift_detected', { externalId, driftedFields: drifted });
  }
}
