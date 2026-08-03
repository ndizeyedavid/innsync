/**
 * DI tokens for the hospitality provider interfaces.
 *
 * Feature modules inject by token; the HospitalityModule wires up either
 * the mock or the external implementation at boot. This is the seam that
 * makes the entire system independent of the upstream HMS.
 *
 *   constructor(@Inject(RESERVATION_PROVIDER) private readonly reservations: ReservationProvider) {}
 */

export const RESERVATION_PROVIDER = Symbol('RESERVATION_PROVIDER');
export const ROOM_PROVIDER = Symbol('ROOM_PROVIDER');
export const FOLIO_PROVIDER = Symbol('FOLIO_PROVIDER');
export const ROOM_SERVICE_PROVIDER = Symbol('ROOM_SERVICE_PROVIDER');
export const HOUSEKEEPING_PROVIDER = Symbol('HOUSEKEEPING_PROVIDER');
export const ACTIVITY_PROVIDER = Symbol('ACTIVITY_PROVIDER');
