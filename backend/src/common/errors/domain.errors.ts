/**
 * Domain-layer errors.
 *
 * These are NOT HttpExceptions — they're plain typed errors thrown by services.
 * The global filter (`AllExceptionsFilter`) maps them to RFC 7807 responses.
 *
 * Why split error taxonomy from HTTP? So services stay framework-agnostic and
 * are easier to unit test.
 */

export abstract class DomainError extends Error {
  /** Application code — stable, machine-friendly, used by clients & support. */
  abstract readonly code: string;
  /** Best-effort HTTP status mapping. The filter is the final authority. */
  abstract readonly httpStatus: number;
  /** Optional cause for chaining. */
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_FAILED';
  readonly httpStatus = 422;
  constructor(message: string, public readonly details?: Record<string, string[]>) {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly httpStatus = 404;
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
  readonly httpStatus = 401;
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
  readonly httpStatus = 403;
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
  readonly httpStatus = 409;
}

export class RateLimitedError extends DomainError {
  readonly code = 'RATE_LIMITED';
  readonly httpStatus = 429;
}

/**
 * The external HMS API misbehaved. Distinct from a generic 500 — callers
 * can decide whether to retry, degrade, or surface to the user.
 */
export class ExternalProviderError extends DomainError {
  // Typed as string/number (not the literal) so subclasses can override.
  readonly code: string = 'EXTERNAL_PROVIDER_ERROR';
  readonly httpStatus: number = 502;
  constructor(message: string, public readonly provider: string, cause?: unknown) {
    super(message, cause);
  }
}

export class ExternalProviderUnavailableError extends ExternalProviderError {
  readonly code = 'EXTERNAL_PROVIDER_UNAVAILABLE';
  readonly httpStatus = 503;
}

export class IdempotencyConflictError extends DomainError {
  readonly code = 'IDEMPOTENCY_CONFLICT';
  readonly httpStatus = 409;
  constructor(public readonly idempotencyKey: string) {
    super(`Idempotency key ${idempotencyKey} already used with a different request body`);
  }
}
