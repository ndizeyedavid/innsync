import { SetMetadata } from '@nestjs/common';

/** Marker metadata key used by IdempotencyInterceptor. */
export const IDEMPOTENT_KEY = 'innsync:idempotent';

/**
 * Decorate a route to require an `Idempotency-Key` header and enable
 * write-replay semantics. Apply on every mutating endpoint that
 * shouldn't double-execute (orders, payments, bookings).
 */
export const Idempotent = (): MethodDecorator & ClassDecorator => SetMetadata(IDEMPOTENT_KEY, true);
