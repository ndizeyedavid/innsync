/**
 * The Reservation provider contract.
 *
 * Every implementation (Mock, External) must pass this suite. The test
 * file is parameterized — concrete spec files (`*.spec.ts`) supply the
 * provider factory.
 *
 * This file is the single source of truth for what the interface promises.
 */
import { ReservationProvider } from 'src/hospitality/domain/providers/reservation.provider';

export function reservationProviderContract(
  name: string,
  makeProvider: () => Promise<{ provider: ReservationProvider; reset: () => Promise<void> }>,
): void {
  describe(`ReservationProvider contract — ${name}`, () => {
    let provider: ReservationProvider;
    let reset: () => Promise<void>;

    beforeEach(async () => {
      const built = await makeProvider();
      provider = built.provider;
      reset = built.reset;
    });

    afterEach(async () => {
      await reset();
    });

    it('createReservation returns a domain Reservation', async () => {
      const r = await provider.createReservation({
        guestExternalId: 'GUEST-A',
        hotelId: 'demo-hotel',
        checkIn: new Date('2030-01-01'),
        checkOut: new Date('2030-01-04'),
        adults: 2,
        children: 0,
      });
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.data.externalId).toMatch(/.+/);
      expect(r.data.nights).toBe(3);
      expect(r.data.status).toBe('PENDING');
      expect(r.data.totalCents).toBeGreaterThan(0);
    });

    it('getReservation by id returns the same data', async () => {
      const created = await provider.createReservation({
        guestExternalId: 'GUEST-A',
        hotelId: 'demo-hotel',
        checkIn: new Date('2030-02-01'),
        checkOut: new Date('2030-02-03'),
        adults: 1,
        children: 0,
      });
      if (!created.ok) throw new Error('create failed');
      const got = await provider.getReservation(created.data.externalId);
      expect(got.ok).toBe(true);
      if (!got.ok) return;
      expect(got.data.externalId).toBe(created.data.externalId);
    });

    it('getReservation returns not_found for unknown id', async () => {
      const r = await provider.getReservation('does-not-exist');
      expect(r.ok).toBe(false);
      if (r.ok) return;
      expect(r.reason).toBe('not_found');
    });

    it('listForGuest returns only that guest’s reservations', async () => {
      await provider.createReservation({
        guestExternalId: 'GUEST-A',
        hotelId: 'demo-hotel',
        checkIn: new Date('2030-03-01'),
        checkOut: new Date('2030-03-02'),
        adults: 1,
        children: 0,
      });
      await provider.createReservation({
        guestExternalId: 'GUEST-B',
        hotelId: 'demo-hotel',
        checkIn: new Date('2030-03-05'),
        checkOut: new Date('2030-03-06'),
        adults: 1,
        children: 0,
      });
      const r = await provider.listForGuest('GUEST-A');
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.data.every((res) => res.guestExternalId === 'GUEST-A')).toBe(true);
      expect(r.data.length).toBeGreaterThanOrEqual(1);
    });

    it('checkIn moves a PENDING reservation to CHECKED_IN', async () => {
      const created = await provider.createReservation({
        guestExternalId: 'GUEST-A',
        hotelId: 'demo-hotel',
        checkIn: new Date('2030-04-01'),
        checkOut: new Date('2030-04-02'),
        adults: 1,
        children: 0,
      });
      if (!created.ok) throw new Error('create failed');
      const checked = await provider.checkIn(created.data.externalId);
      expect(checked.ok).toBe(true);
      if (!checked.ok) return;
      expect(checked.data.status).toBe('CHECKED_IN');
    });

    it('cancelReservation transitions to CANCELLED', async () => {
      const created = await provider.createReservation({
        guestExternalId: 'GUEST-A',
        hotelId: 'demo-hotel',
        checkIn: new Date('2030-05-01'),
        checkOut: new Date('2030-05-02'),
        adults: 1,
        children: 0,
      });
      if (!created.ok) throw new Error('create failed');
      const cancel = await provider.cancelReservation(created.data.externalId, 'guest changed plans');
      expect(cancel.ok).toBe(true);
      const after = await provider.getReservation(created.data.externalId);
      if (!after.ok) throw new Error('get-after-cancel failed');
      expect(after.data.status).toBe('CANCELLED');
    });

    it('cancelReservation on unknown id returns not_found', async () => {
      const r = await provider.cancelReservation('does-not-exist');
      expect(r.ok).toBe(false);
      if (r.ok) return;
      expect(r.reason).toBe('not_found');
    });
  });
}
