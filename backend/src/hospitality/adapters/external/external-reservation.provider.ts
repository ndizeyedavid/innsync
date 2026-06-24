import { Inject, Injectable, Logger } from '@nestjs/common';
import { ReservationProvider } from '../../domain/providers/reservation.provider';
import {
  CreateReservationInput,
  Reservation,
} from '../../domain/models/reservation.model';
import { err, ok, ProviderResult } from '../../domain/provider-result';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ExternalHmsClient } from './external-hms.client';
import { ReservationMapper } from './mappers/reservation.mapper';
import { ExternalReservationV1Dto } from './dtos/external-reservation.dto';
import {
  CircuitOpenError,
  ConnectError,
  NotFoundHttpError,
  TimeoutError,
  UnauthorizedHttpError,
} from 'src/infrastructure/http/http-errors';
import { ValidationError } from 'src/common/errors/domain.errors';

/**
 * External reservation provider — talks to the real HMS.
 *
 * Three behaviors that distinguish it from the mock:
 *   1. Every read tries the upstream first, falls back to ReservationCache
 *      on transport failure. The fallback carries `source: 'cache'` so
 *      callers can decorate the UI ("last updated…").
 *   2. Writes pass through the resilient HTTP layer with an idempotency key
 *      so accidental retries don't duplicate state upstream.
 *   3. Mapping/validation is strict — if the HMS sends a shape we don't
 *      understand, we return `{ ok: false, reason: 'invalid' }` and surface
 *      schema drift in logs + metrics.
 */
@Injectable()
export class ExternalReservationProvider implements ReservationProvider {
  private readonly logger = new Logger(ExternalReservationProvider.name);

  constructor(
    private readonly http: ExternalHmsClient,
    private readonly prisma: PrismaService,
  ) {}

  async createReservation(input: CreateReservationInput): Promise<ProviderResult<Reservation>> {
    try {
      const payload = ReservationMapper.toCreatePayload(input);
      const idempotencyKey = `create-res-${input.guestExternalId}-${input.checkIn.toISOString().slice(0, 10)}-${input.checkOut.toISOString().slice(0, 10)}`;
      const dto = await this.http.post<ExternalReservationV1Dto>('/v1/reservations', payload, {
        operation: 'createReservation',
        idempotencyKey,
      });
      const domain = ReservationMapper.toDomain(dto);
      await this.writeCache(domain);
      return ok(domain);
    } catch (e) {
      return this.classify(e, 'createReservation');
    }
  }

  async getReservation(externalId: string): Promise<ProviderResult<Reservation>> {
    try {
      const dto = await this.http.get<ExternalReservationV1Dto>(`/v1/reservations/${externalId}`, {
        operation: 'getReservation',
      });
      const domain = ReservationMapper.toDomain(dto);
      await this.writeCache(domain);
      return ok(domain);
    } catch (e) {
      // Cache fallback for read paths
      const cached = await this.readCache(externalId);
      if (cached && (e instanceof TimeoutError || e instanceof ConnectError || e instanceof CircuitOpenError)) {
        this.logger.warn({ err: (e as Error).message, externalId }, 'reservation degraded → cache');
        return { ok: true, data: cached, source: 'cache' };
      }
      return this.classify(e, 'getReservation', cached ?? undefined);
    }
  }

  async listForGuest(guestExternalId: string): Promise<ProviderResult<Reservation[]>> {
    try {
      const dtos = await this.http.get<ExternalReservationV1Dto[]>(
        `/v1/guests/${guestExternalId}/reservations`,
        { operation: 'listForGuest' },
      );
      const domain = dtos.map((d) => ReservationMapper.toDomain(d));
      await Promise.all(domain.map((r) => this.writeCache(r)));
      return ok(domain);
    } catch (e) {
      return this.classify(e, 'listForGuest', []);
    }
  }

  async cancelReservation(externalId: string, reason?: string): Promise<ProviderResult<void>> {
    try {
      await this.http.post(
        `/v1/reservations/${externalId}/cancel`,
        { reason },
        { operation: 'cancelReservation', idempotencyKey: `cancel-${externalId}` },
      );
      // Invalidate cache (or update the snapshot to CANCELLED)
      await this.prisma.reservationCache.deleteMany({ where: { externalId } });
      return ok(undefined);
    } catch (e) {
      return this.classify(e, 'cancelReservation');
    }
  }

  async checkIn(externalId: string): Promise<ProviderResult<Reservation>> {
    try {
      const dto = await this.http.post<ExternalReservationV1Dto>(
        `/v1/reservations/${externalId}/check-in`,
        {},
        { operation: 'checkIn', idempotencyKey: `checkin-${externalId}` },
      );
      const domain = ReservationMapper.toDomain(dto);
      await this.writeCache(domain);
      return ok(domain);
    } catch (e) {
      return this.classify(e, 'checkIn');
    }
  }

  // ─── helpers ──────────────────────────────────────────────────────

  private async writeCache(r: Reservation): Promise<void> {
    await this.prisma.reservationCache.upsert({
      where: { externalId: r.externalId },
      update: { snapshot: r as unknown as object, fetchedAt: new Date() },
      create: { externalId: r.externalId, snapshot: r as unknown as object },
    });
  }

  private async readCache(externalId: string): Promise<Reservation | null> {
    const row = await this.prisma.reservationCache.findUnique({ where: { externalId } });
    return row ? (row.snapshot as unknown as Reservation) : null;
  }

  /**
   * Turn low-level HTTP errors into ProviderResult.err with the right `reason`.
   * Returning a fallback is optional — only the caller decides whether
   * partial data is acceptable.
   */
  private classify<T>(
    e: unknown,
    op: string,
    fallback?: T,
  ): ProviderResult<T> {
    if (e instanceof NotFoundHttpError) return err('not_found');
    if (e instanceof UnauthorizedHttpError) return err('auth', e);
    if (e instanceof ValidationError) return err('invalid', e);
    if (
      e instanceof TimeoutError ||
      e instanceof ConnectError ||
      e instanceof CircuitOpenError
    ) {
      this.logger.warn({ op, err: (e as Error).message }, 'external reservation provider unavailable');
      return err('unavailable', e, fallback);
    }
    this.logger.error({ op, err: e }, 'external reservation provider error');
    return err('invalid', e, fallback);
  }
}
