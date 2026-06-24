import { Injectable, Logger } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { ReservationProvider } from '../../domain/providers/reservation.provider';
import {
  CreateReservationInput,
  Reservation,
  ReservationStatus,
} from '../../domain/models/reservation.model';
import { err, ok, ProviderResult } from '../../domain/provider-result';
import { MockStore } from './mock-store';

/**
 * Realistic in-memory reservation provider.
 *
 * Implements the full lifecycle:
 *   - createReservation → PENDING with computed nights/total
 *   - checkIn → CHECKED_IN (only valid from PENDING|CONFIRMED)
 *   - cancelReservation → CANCELLED
 *
 * Configurable knobs (env):
 *   MOCK_LATENCY_MS — simulated upstream latency.
 *   MOCK_FAILURE_RATE — random failure injection.
 *   MOCK_OUTAGES=reservations — force every call to fail.
 */
@Injectable()
export class MockReservationProvider implements ReservationProvider {
  private readonly logger = new Logger(MockReservationProvider.name);
  private readonly NS = 'reservation';

  constructor(private readonly store: MockStore) {}

  async createReservation(
    input: CreateReservationInput,
  ): Promise<ProviderResult<Reservation>> {
    await this.store.delay();
    if (this.store.shouldFail('reservations')) return err('unavailable', new Error('Mock outage'));

    const nights = Math.max(
      1,
      Math.round((input.checkOut.getTime() - input.checkIn.getTime()) / 86_400_000),
    );
    const reservation: Reservation = {
      externalId: `MOCK-RES-${createId().slice(0, 8).toUpperCase()}`,
      hotelId: input.hotelId,
      guestExternalId: input.guestExternalId,
      status: 'PENDING',
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights,
      adults: input.adults,
      children: input.children,
      roomExternalId: null,
      totalCents: 22_000 * nights, // demo flat rate
      currency: 'USD',
      metadata: input.metadata,
    };
    await this.store.put(this.NS, reservation.externalId, reservation);
    return ok(reservation);
  }

  async getReservation(externalId: string): Promise<ProviderResult<Reservation>> {
    await this.store.delay();
    if (this.store.shouldFail('reservations')) return err('unavailable');
    const found = await this.store.get<Reservation>(this.NS, externalId);
    if (!found) return err('not_found');
    // Deserialize Dates that round-tripped through JSON
    return ok(rehydrateDates(found));
  }

  async listForGuest(guestExternalId: string): Promise<ProviderResult<Reservation[]>> {
    await this.store.delay();
    if (this.store.shouldFail('reservations')) return err('unavailable', undefined, []);
    const all = await this.store.list<Reservation>(this.NS);
    return ok(all.filter((r) => r.guestExternalId === guestExternalId).map(rehydrateDates));
  }

  async cancelReservation(externalId: string, reason?: string): Promise<ProviderResult<void>> {
    await this.store.delay();
    if (this.store.shouldFail('reservations')) return err('unavailable');
    const found = await this.store.get<Reservation>(this.NS, externalId);
    if (!found) return err('not_found');
    if (found.status === 'CHECKED_OUT') return err('invalid', new Error('Stay already completed'));
    found.status = 'CANCELLED';
    found.metadata = { ...(found.metadata ?? {}), cancellationReason: reason };
    await this.store.put(this.NS, externalId, found);
    return ok(undefined);
  }

  async checkIn(externalId: string): Promise<ProviderResult<Reservation>> {
    await this.store.delay();
    if (this.store.shouldFail('reservations')) return err('unavailable');
    const found = await this.store.get<Reservation>(this.NS, externalId);
    if (!found) return err('not_found');
    const allowed: ReservationStatus[] = ['PENDING', 'CONFIRMED'];
    if (!allowed.includes(found.status)) {
      return err('conflict', new Error(`Cannot check in from status ${found.status}`));
    }
    found.status = 'CHECKED_IN';
    await this.store.put(this.NS, externalId, found);
    return ok(rehydrateDates(found));
  }
}

function rehydrateDates(r: Reservation): Reservation {
  return {
    ...r,
    checkIn: new Date(r.checkIn),
    checkOut: new Date(r.checkOut),
  };
}
