import { ProviderResult } from '../provider-result';
import { CreateReservationInput, Reservation } from '../models/reservation.model';

/**
 * The stable interface every reservation-touching service depends on.
 *
 * Implementations:
 *   - MockReservationProvider — in-memory, deterministic, fast.
 *   - ExternalReservationProvider — wraps the real HMS, maps DTOs, falls
 *     back to local cache on outage.
 *
 * Adding a method here is a deliberate act: it's a contract change.
 * Cross-mock+external contract tests pin the behavior of every method.
 */
export interface ReservationProvider {
  createReservation(input: CreateReservationInput): Promise<ProviderResult<Reservation>>;
  getReservation(externalId: string): Promise<ProviderResult<Reservation>>;
  listForGuest(guestExternalId: string): Promise<ProviderResult<Reservation[]>>;
  cancelReservation(externalId: string, reason?: string): Promise<ProviderResult<void>>;
  /**
   * Mark check-in. Some HMS APIs use a separate "arrival" endpoint; the
   * provider abstracts this so the service doesn't care.
   */
  checkIn(externalId: string): Promise<ProviderResult<Reservation>>;
}
