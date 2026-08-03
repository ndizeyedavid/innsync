/**
 * Mapper unit tests — proves the external→domain translation is correct,
 * and that schema drift is loudly caught.
 */
import { ReservationMapper } from 'src/hospitality/adapters/external/mappers/reservation.mapper';
import { ValidationError } from 'src/common/errors/domain.errors';
import { ExternalReservationV1Dto } from 'src/hospitality/adapters/external/dtos/external-reservation.dto';

const sample: ExternalReservationV1Dto = {
  id: 'ext-1',
  hotel_id: 'h-1',
  guest: { id: 'g-1' },
  state: 'in_house',
  arrival_date: '2030-01-01T00:00:00.000Z',
  departure_date: '2030-01-04T00:00:00.000Z',
  party: { adults: 2, children: 1 },
  assigned_room: { id: 'r-9' },
  pricing: { total_minor_units: 99_000, currency: 'USD' },
};

describe('ReservationMapper.toDomain', () => {
  it('maps fields correctly and computes nights', () => {
    const d = ReservationMapper.toDomain(sample);
    expect(d.externalId).toBe('ext-1');
    expect(d.hotelId).toBe('h-1');
    expect(d.guestExternalId).toBe('g-1');
    expect(d.status).toBe('CHECKED_IN');
    expect(d.nights).toBe(3);
    expect(d.adults).toBe(2);
    expect(d.children).toBe(1);
    expect(d.roomExternalId).toBe('r-9');
    expect(d.totalCents).toBe(99_000);
    expect(d.currency).toBe('USD');
  });

  it('throws on an unknown state — schema drift caught here', () => {
    const bad = { ...sample, state: 'levitating' as ExternalReservationV1Dto['state'] };
    expect(() => ReservationMapper.toDomain(bad)).toThrow(ValidationError);
  });

  it('throws on invalid date — refuses to silently produce NaN', () => {
    const bad = { ...sample, arrival_date: 'not-a-date' };
    expect(() => ReservationMapper.toDomain(bad)).toThrow(ValidationError);
  });
});
