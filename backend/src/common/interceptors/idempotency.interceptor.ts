import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, of, switchMap, tap } from 'rxjs';
import { createHash } from 'crypto';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { IdempotencyConflictError, ValidationError } from '../errors/domain.errors';
import { IDEMPOTENT_KEY } from '../decorators/idempotent.decorator';

/**
 * Inbound idempotency.
 *
 * For routes decorated with @Idempotent(), the interceptor:
 *   1. Requires an `Idempotency-Key` header (UUID-ish).
 *   2. Looks up an existing record by (userId, key, route).
 *   3. If found AND completed AND requestHash matches → replay response.
 *   4. If found but body hash differs → 409 (client misuse).
 *   5. If found but in-flight (lock not expired) → 409, ask client to retry.
 *   6. Otherwise → reserve the slot, let the handler run, write result on success.
 *
 * The idempotency record TTL is 24h by default; long enough to cover client
 * retries, short enough that the table doesn't grow unbounded.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);
  private static readonly TTL_MS = 24 * 60 * 60 * 1000;
  private static readonly IN_FLIGHT_LOCK_MS = 30 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isIdempotent = this.reflector.getAllAndOverride<boolean>(IDEMPOTENT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isIdempotent) return next.handle();

    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      body: unknown;
      route: { path: string };
      user?: { sub: string };
      method: string;
    }>();
    const key = req.headers['idempotency-key'];
    if (!key) throw new ValidationError('Idempotency-Key header is required for this endpoint');
    if (!/^[A-Za-z0-9_-]{8,128}$/.test(key)) {
      throw new ValidationError('Idempotency-Key must be 8–128 chars, [A-Za-z0-9_-]');
    }
    const userId = req.user?.sub ?? 'anonymous';
    const route = `${req.method} ${req.route?.path ?? ''}`;
    const requestHash = hashJson(req.body);
    const id = createHash('sha256').update(`${userId}|${key}|${route}`).digest('hex').slice(0, 32);

    return from(
      this.prisma.idempotencyRecord.findUnique({ where: { id } }),
    ).pipe(
      switchMap((existing) => {
        const now = new Date();
        if (existing) {
          if (existing.requestHash !== requestHash) throw new IdempotencyConflictError(key);
          if (existing.completedAt) {
            // Replay
            this.logger.debug({ key, userId, route }, 'idempotency replay');
            return of({ __idempotency_replay: true, body: existing.responseBody, status: existing.responseStatus });
          }
          if (existing.inFlightUntil && existing.inFlightUntil > now) {
            throw new IdempotencyConflictError(key);
          }
        }

        return from(
          this.prisma.idempotencyRecord.upsert({
            where: { id },
            create: {
              id,
              userId,
              key,
              route,
              requestHash,
              inFlightUntil: new Date(now.getTime() + IdempotencyInterceptor.IN_FLIGHT_LOCK_MS),
              expiresAt: new Date(now.getTime() + IdempotencyInterceptor.TTL_MS),
            },
            update: {
              inFlightUntil: new Date(now.getTime() + IdempotencyInterceptor.IN_FLIGHT_LOCK_MS),
            },
          }),
        ).pipe(
          switchMap(() => {
            const res = context.switchToHttp().getResponse<{ statusCode: number }>();
            return next.handle().pipe(
              tap((body) => {
                // Persist response so future retries replay.
                this.prisma.idempotencyRecord
                  .update({
                    where: { id },
                    data: {
                      responseStatus: res.statusCode,
                      responseBody: body as object,
                      completedAt: new Date(),
                      inFlightUntil: null,
                    },
                  })
                  .catch((err) =>
                    this.logger.error({ err }, 'failed to persist idempotency response'),
                  );
              }),
            );
          }),
        );
      }),
      // Replay short-circuit: synthesize the response from the recorded body
      switchMap((value) => {
        if (
          value &&
          typeof value === 'object' &&
          (value as { __idempotency_replay?: boolean }).__idempotency_replay
        ) {
          return of((value as { body: unknown }).body);
        }
        return of(value);
      }),
    );
  }
}

function hashJson(body: unknown): string {
  const canonical = JSON.stringify(body, Object.keys((body as object) ?? {}).sort());
  return createHash('sha256').update(canonical).digest('hex');
}
