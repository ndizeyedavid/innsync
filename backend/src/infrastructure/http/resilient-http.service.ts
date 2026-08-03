import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import CircuitBreaker from 'opossum';
import {
  BadRequestHttpError,
  CircuitOpenError,
  ConnectError,
  NotFoundHttpError,
  ServerHttpError,
  TimeoutError,
  UnauthorizedHttpError,
} from './http-errors';

export interface ResilientCallOptions {
  /** Per-call timeout override (ms). */
  timeoutMs?: number;
  /** Retries on transient errors (5xx, network). 0 disables retry. */
  retries?: number;
  /**
   * Mark the request as idempotent so retries are safe. Non-idempotent
   * writes default to retries=0 unless the upstream supports Idempotency-Key.
   */
  idempotent?: boolean;
  /** Optional idempotency key for upstream dedup (we'll set the header). */
  idempotencyKey?: string;
  /** Tag for metrics/tracing. */
  operation: string;
}

export interface ResilientHttpOptions {
  baseURL: string;
  defaultTimeoutMs: number;
  circuitThresholdPercent: number;
  circuitTimeoutMs: number;
  buildHeaders?: () => Record<string, string>;
}

/**
 * A small, opinionated HTTP layer for outbound calls to unstable providers.
 *
 *   - timeouts: every request has one. Default is conservative.
 *   - retries: exponential backoff + full jitter, only on transient failures.
 *   - circuit breaker: trips when failure rate exceeds threshold; half-open
 *     after a cooldown.
 *   - error classification: maps low-level errors to typed exceptions so
 *     adapters can pattern-match cleanly.
 */
@Injectable()
export class ResilientHttp {
  private readonly logger = new Logger(ResilientHttp.name);
  private readonly axios: AxiosInstance;
  private readonly breaker: CircuitBreaker<[ResilientCallOptions, AxiosRequestConfig], unknown>;

  constructor(private readonly options: ResilientHttpOptions) {
    this.axios = axios.create({
      baseURL: options.baseURL,
      timeout: options.defaultTimeoutMs,
    });

    this.breaker = new CircuitBreaker(this.executeOnce.bind(this), {
      timeout: options.defaultTimeoutMs * 2, // axios timeout is primary; this is a backstop
      errorThresholdPercentage: options.circuitThresholdPercent,
      resetTimeout: options.circuitTimeoutMs,
      rollingCountTimeout: 30_000,
      rollingCountBuckets: 10,
    });
    this.breaker.on('open', () => this.logger.warn('Circuit OPEN — failing fast'));
    this.breaker.on('halfOpen', () => this.logger.log('Circuit half-open — probing'));
    this.breaker.on('close', () => this.logger.log('Circuit CLOSED — healthy'));
  }

  async get<T>(path: string, options: ResilientCallOptions): Promise<T> {
    return this.request<T>({ method: 'GET', url: path }, options);
  }
  async post<T>(path: string, body: unknown, options: ResilientCallOptions): Promise<T> {
    return this.request<T>({ method: 'POST', url: path, data: body }, options);
  }
  async put<T>(path: string, body: unknown, options: ResilientCallOptions): Promise<T> {
    return this.request<T>({ method: 'PUT', url: path, data: body }, options);
  }
  async delete<T>(path: string, options: ResilientCallOptions): Promise<T> {
    return this.request<T>({ method: 'DELETE', url: path }, options);
  }

  private async request<T>(req: AxiosRequestConfig, options: ResilientCallOptions): Promise<T> {
    const headers: Record<string, string> = {
      ...(this.options.buildHeaders?.() ?? {}),
      ...((req.headers as Record<string, string>) ?? {}),
    };
    if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
    const withHeaders: AxiosRequestConfig = {
      ...req,
      headers,
      timeout: options.timeoutMs ?? this.options.defaultTimeoutMs,
    };
    const attempts = Math.max(0, options.idempotent !== false ? options.retries ?? 0 : 0);
    return this.attempt<T>(withHeaders, options, attempts);
  }

  private async attempt<T>(
    req: AxiosRequestConfig,
    options: ResilientCallOptions,
    attemptsLeft: number,
  ): Promise<T> {
    try {
      return (await this.breaker.fire(options, req)) as T;
    } catch (err) {
      // Circuit-open: never retry, surface immediately.
      if (this.isCircuitOpen(err)) throw new CircuitOpenError('Circuit is open');

      // Non-retryable failures bubble up.
      if (!this.isRetryable(err) || attemptsLeft <= 0) throw err;

      const backoff = this.jitteredBackoff(options.retries ?? 0, attemptsLeft);
      this.logger.debug({ err: (err as Error).message, backoff }, `retrying ${options.operation}`);
      await sleep(backoff);
      return this.attempt<T>(req, options, attemptsLeft - 1);
    }
  }

  /**
   * Single attempt — does NOT retry. The CircuitBreaker tracks success/failure here.
   */
  private async executeOnce(_options: ResilientCallOptions, req: AxiosRequestConfig): Promise<unknown> {
    try {
      const res = await this.axios.request(req);
      return res.data;
    } catch (rawErr) {
      throw this.classify(rawErr as AxiosError);
    }
  }

  // ─── Error classification ────────────────────────────────────────

  private classify(err: AxiosError): Error {
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      return new TimeoutError('Upstream timed out', err);
    }
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ECONNRESET') {
      return new ConnectError('Upstream connection failure', err);
    }
    const status = err.response?.status;
    const body = err.response?.data;
    if (status === undefined) return new ConnectError('Upstream unreachable', err);
    if (status === 404) return new NotFoundHttpError('Not found');
    if (status === 401 || status === 403) return new UnauthorizedHttpError('Unauthorized');
    if (status >= 400 && status < 500) {
      return new BadRequestHttpError(`Upstream rejected request (${status})`, status, body);
    }
    return new ServerHttpError(`Upstream server error (${status})`, status, body);
  }

  private isRetryable(err: unknown): boolean {
    return (
      err instanceof TimeoutError ||
      err instanceof ConnectError ||
      err instanceof ServerHttpError
    );
  }

  private isCircuitOpen(err: unknown): boolean {
    // opossum throws an error with `.code === 'EOPENBREAKER'`
    return (
      err instanceof Error && (err as Error & { code?: string }).code === 'EOPENBREAKER'
    );
  }

  private jitteredBackoff(totalRetries: number, attemptsLeft: number): number {
    const attemptNumber = totalRetries - attemptsLeft + 1;
    const base = Math.min(2_000, 100 * 2 ** attemptNumber);
    return Math.floor(Math.random() * base);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
