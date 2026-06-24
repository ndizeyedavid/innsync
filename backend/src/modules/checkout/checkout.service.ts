import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { FOLIO_PROVIDER, RESERVATION_PROVIDER } from 'src/hospitality/tokens';
import { FolioProvider } from 'src/hospitality/domain/providers/folio.provider';
import { ReservationProvider } from 'src/hospitality/domain/providers/reservation.provider';
import { EventBus } from 'src/infrastructure/events/event-bus.service';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from 'src/common/errors/domain.errors';

/**
 * Express checkout orchestrator.
 *
 * Sequence (best-effort, with idempotency):
 *   1. Force-refresh folio.
 *   2. Capture payment via the configured PaymentProvider. (omitted here —
 *      see PaymentsService; the orchestration hook is in `capturePayment`.)
 *   3. Close folio upstream.
 *   4. Mark the local stay CHECKED_OUT.
 *   5. Emit `checkout.completed` so downstream (loyalty, eco score, receipt)
 *      can react via OnEvent handlers.
 */
@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventBus,
    @Inject(FOLIO_PROVIDER) private readonly folios: FolioProvider,
    @Inject(RESERVATION_PROVIDER) private readonly reservations: ReservationProvider,
  ) {}

  async expressCheckout(userId: string, stayId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');
    if (!stay.externalReservationId) throw new ConflictError('Stay not provisioned');
    if (stay.status === 'CHECKED_OUT') throw new ConflictError('Already checked out');

    // 1. Final folio fetch — MUST be live
    const folio = await this.folios.getFolio(stay.externalReservationId, { forceRefresh: true });
    if (!folio.ok) throw new ConflictError(`Could not finalize folio: ${folio.reason}`);

    // 2. Payment capture — delegated to PaymentsService in real code
    // await this.payments.capture({ amountCents: folio.data.totalCents, ... });

    // 3. Close folio
    await this.folios.closeFolio(stay.externalReservationId);

    // 4. Local state
    await this.prisma.guestStay.update({
      where: { id: stayId },
      data: { status: 'CHECKED_OUT' },
    });

    // 5. Domain event for fan-out
    this.events.emit('checkout.completed', {
      stayId: stay.id,
      userId,
      totalCents: folio.data.totalCents,
    });

    return { stayId: stay.id, totalCents: folio.data.totalCents, currency: folio.data.currency };
  }
}
