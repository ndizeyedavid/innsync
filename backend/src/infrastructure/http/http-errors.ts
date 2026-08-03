/**
 * Typed errors thrown by the resilient HTTP client. Provider adapters
 * pattern-match on these to decide whether to retry, fail soft (cache),
 * or surface as a domain error.
 */

export class HttpClientError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
  }
}

export class TimeoutError extends HttpClientError {}
export class ConnectError extends HttpClientError {}
export class NotFoundHttpError extends HttpClientError {}
export class UnauthorizedHttpError extends HttpClientError {}
export class BadRequestHttpError extends HttpClientError {
  constructor(message: string, public readonly status: number, public readonly body?: unknown) {
    super(message);
  }
}
export class ServerHttpError extends HttpClientError {
  constructor(message: string, public readonly status: number, public readonly body?: unknown) {
    super(message);
  }
}
export class CircuitOpenError extends HttpClientError {}
