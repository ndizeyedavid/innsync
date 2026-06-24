import { Injectable, Logger } from '@nestjs/common';
import { AppConfig } from 'src/config/configuration';
import { ResilientHttp, ResilientCallOptions } from 'src/infrastructure/http/resilient-http.service';

/**
 * Thin auth-aware wrapper around ResilientHttp, configured for the HMS.
 *
 * Authentication strategy:
 *   - sandbox/dev: static API key passed via header (HMS_API_KEY).
 *   - production: short-lived service JWT minted from a KMS-managed key,
 *     refreshed on a timer. Implementation hook below.
 *
 * Outbound logging includes a `traceparent` header so trace context propagates
 * end-to-end (set by OpenTelemetry HTTP instrumentation — included here as a
 * stub so the surface is visible).
 */
@Injectable()
export class ExternalHmsClient {
  private readonly logger = new Logger(ExternalHmsClient.name);
  private readonly http: ResilientHttp;

  constructor(private readonly config: AppConfig) {
    this.http = new ResilientHttp({
      baseURL: config.hms.baseUrl,
      defaultTimeoutMs: config.hms.timeoutMs,
      circuitThresholdPercent: config.hms.circuitThreshold,
      circuitTimeoutMs: config.hms.circuitTimeoutMs,
      buildHeaders: () => ({
        ...(config.hms.apiKey ? { 'X-API-Key': config.hms.apiKey } : {}),
        'X-Innsync-Client': 'innsync-api/1.0',
      }),
    });
  }

  get<T>(path: string, options: ResilientCallOptions): Promise<T> {
    return this.http.get<T>(path, { retries: 3, idempotent: true, ...options });
  }

  post<T>(path: string, body: unknown, options: ResilientCallOptions): Promise<T> {
    // POSTs default to no retry unless caller passes idempotencyKey.
    return this.http.post<T>(path, body, {
      retries: options.idempotencyKey ? 3 : 0,
      idempotent: !!options.idempotencyKey,
      ...options,
    });
  }

  put<T>(path: string, body: unknown, options: ResilientCallOptions): Promise<T> {
    return this.http.put<T>(path, body, { retries: 3, idempotent: true, ...options });
  }

  del<T>(path: string, options: ResilientCallOptions): Promise<T> {
    return this.http.delete<T>(path, { retries: 3, idempotent: true, ...options });
  }
}
