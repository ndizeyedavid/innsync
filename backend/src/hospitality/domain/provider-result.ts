/**
 * The discriminated-union return type that every hospitality provider call
 * produces. Forcing callers to pattern-match on `ok` (and on the `source`
 * when ok) prevents the failure paths from being silently swallowed.
 *
 *   const r = await reservations.getReservation(id);
 *   if (!r.ok) {
 *     if (r.reason === 'not_found') throw new NotFoundError('...');
 *     if (r.reason === 'unavailable' && r.fallback) return r.fallback;
 *     throw new ExternalProviderError('...', 'reservations', r.cause);
 *   }
 *   return r.data; // source: 'live' or 'cache'
 */

export type ProviderResultOk<T> = {
  ok: true;
  data: T;
  source: 'live' | 'cache';
  fetchedAt?: Date;
};

export type ProviderResultErr<T> = {
  ok: false;
  reason: 'unavailable' | 'not_found' | 'invalid' | 'auth' | 'conflict';
  cause?: unknown;
  /** Optional last-known-good fallback if the caller wants degraded behavior. */
  fallback?: T;
};

export type ProviderResult<T> = ProviderResultOk<T> | ProviderResultErr<T>;

export function ok<T>(data: T, source: 'live' | 'cache' = 'live', fetchedAt?: Date): ProviderResultOk<T> {
  return { ok: true, data, source, fetchedAt };
}

export function err<T>(
  reason: ProviderResultErr<T>['reason'],
  cause?: unknown,
  fallback?: T,
): ProviderResultErr<T> {
  return { ok: false, reason, cause, fallback };
}
