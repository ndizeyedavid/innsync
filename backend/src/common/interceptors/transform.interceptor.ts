import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * Wraps successful responses in a `{ data, meta }` envelope.
 *
 * The transform is intentionally minimal: it doesn't rename fields, doesn't
 * strip nulls, doesn't sort. Anything controllers want shaped goes through
 * a DTO. This is the *transport* envelope, not a response mapper.
 *
 * If a controller returns an object with a `_meta` field, the interceptor
 * lifts it to `meta` on the envelope. Useful for cache freshness hints.
 */

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiEnvelope<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiEnvelope<T>> {
    return next.handle().pipe(
      map((payload) => {
        if (payload && typeof payload === 'object' && '_meta' in payload) {
          const { _meta, ...rest } = payload as Record<string, unknown>;
          return { data: rest as unknown as T, meta: _meta as Record<string, unknown> };
        }
        return { data: payload };
      }),
    );
  }
}
