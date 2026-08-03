/**
 * Domain reservation. This is the shape every application service consumes,
 * regardless of where it came from (HMS or mock).
 *
 * If the upstream API exposes more fields than we care about, we drop them
 * in the mapper. If it exposes fewer, the mapper supplies sensible defaults
 * or throws (visible in metrics; we surface upstream schema drift early).
 */

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export interface Reservation {
  externalId: string;
  hotelId: string;
  guestExternalId: string;
  status: ReservationStatus;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  adults: number;
  children: number;
  roomExternalId: string | null;
  totalCents: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface CreateReservationInput {
  guestExternalId: string;
  hotelId: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  roomPreference?: string;
  /** Pass through arbitrary tags we want recorded on the HMS reservation. */
  metadata?: Record<string, unknown>;
}
