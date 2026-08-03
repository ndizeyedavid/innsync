import {
  CreateReservationInput,
  Reservation,
  ReservationStatus,
} from '../../../domain/models/reservation.model';
import {
  ExternalCreateReservationV1Payload,
  ExternalReservationV1Dto,
} from '../dtos/external-reservation.dto';
import { ValidationError } from 'src/common/errors/domain.errors';

/**
 * Pure functions that translate between domain and external DTO shapes.
 *
 * Mapping is the safest place to validate upstream payloads. If the HMS
 * returns something we can't sensibly translate, we throw — the provider
 * catches and returns `{ ok: false, reason: 'invalid' }`. This shows up
 * loud in metrics and traces (Schema drift! Investigate now!).
 */
export const ReservationMapper = {
  toDomain(dto: ExternalReservationV1Dto): Reservation {
    const checkIn = parseDate(dto.arrival_date, 'arrival_date');
    const checkOut = parseDate(dto.departure_date, 'departure_date');
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
    return {
      externalId: dto.id,
      hotelId: dto.hotel_id,
      guestExternalId: dto.guest.id,
      status: mapStatus(dto.state),
      checkIn,
      checkOut,
      nights,
      adults: dto.party.adults,
      children: dto.party.children,
      roomExternalId: dto.assigned_room?.id ?? null,
      totalCents: dto.pricing.total_minor_units,
      currency: dto.pricing.currency,
      metadata: dto.metadata,
    };
  },

  toCreatePayload(input: CreateReservationInput): ExternalCreateReservationV1Payload {
    return {
      hotel_id: input.hotelId,
      guest_id: input.guestExternalId,
      arrival_date: input.checkIn.toISOString(),
      departure_date: input.checkOut.toISOString(),
      adults: input.adults,
      children: input.children,
      preferences: input.roomPreference ? { room_category: input.roomPreference } : undefined,
      metadata: input.metadata,
    };
  },
};

function mapStatus(s: ExternalReservationV1Dto['state']): ReservationStatus {
  switch (s) {
    case 'pending':
      return 'PENDING';
    case 'confirmed':
      return 'CONFIRMED';
    case 'in_house':
      return 'CHECKED_IN';
    case 'departed':
      return 'CHECKED_OUT';
    case 'cancelled':
      return 'CANCELLED';
    default:
      throw new ValidationError(`Unknown external reservation state: ${s as string}`);
  }
}

function parseDate(s: string, field: string): Date {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new ValidationError(`Invalid ${field}: ${s}`);
  return d;
}
