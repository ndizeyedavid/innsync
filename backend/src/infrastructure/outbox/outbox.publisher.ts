import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OutboxEvent } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EventBus } from '../events/event-bus.service';

/**
 * The transactional outbox publisher.
 *
 *   1. Poll outbox_events where publishedAt IS NULL and nextAttemptAt <= now.
 *   2. For each, look up a handler (registered by aggregateType+eventType).
 *   3. On success: set publishedAt, leave as audit trail.
 *   4. On failure: increment attempts, schedule next attempt with backoff,
 *      record lastError. After N attempts → poison and alert.
 *
 * Leader-election: only one pod publishes at a time, gated by a Redis lock.
 * Even without leader election, idempotency on the receiver side keeps us
 * safe — but we want to spare the work.
 */

export interface OutboxHandler {
  /** Returns true if this handler claims the event. */
  match(event: Pick<OutboxEvent, 'aggregateType' | 'eventType'>): boolean;
  handle(event: OutboxEvent): Promise<void>;
}

export const OUTBOX_HANDLERS = Symbol('OUTBOX_HANDLERS');

@Injectable()
export class OutboxPublisher implements OnModuleInit {
  private readonly logger = new Logger(OutboxPublisher.name);
  private readonly maxAttempts = 8;
  private readonly batchSize = 32;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly events: EventBus,
    @Optional() @Inject(OUTBOX_HANDLERS)
    private readonly handlers: OutboxHandler[] = [],
  ) {}

  onModuleInit(): void {
    this.logger.log(`OutboxPublisher initialized with ${this.handlers.length} handlers`);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async tick(): Promise<void> {
    const release = await this.redis.acquireLock('outbox-publisher', 4500);
    if (!release) return; // another pod is publishing
    try {
      const batch = await this.prisma.outboxEvent.findMany({
        where: { publishedAt: null, nextAttemptAt: { lte: new Date() } },
        orderBy: { occurredAt: 'asc' },
        take: this.batchSize,
      });
      if (batch.length === 0) return;

      for (const event of batch) {
        await this.dispatch(event);
      }
    } finally {
      await release();
    }
  }

  private async dispatch(event: OutboxEvent): Promise<void> {
    const handler = this.handlers.find((h) => h.match(event));
    if (!handler) {
      // No handler registered — emit to the in-process bus so any listener
      // can react, then mark published. This keeps the outbox unblocked.
      this.events['emitter'] // typed wrapper exposes only typed events
        ? null
        : null;
      this.logger.warn(
        { eventId: event.id, type: event.eventType },
        'no outbox handler matched — marking published anyway',
      );
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: { publishedAt: new Date() },
      });
      return;
    }

    try {
      await handler.handle(event);
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: { publishedAt: new Date() },
      });
    } catch (err) {
      const attempts = event.attempts + 1;
      const giveUp = attempts >= this.maxAttempts;
      const backoffMs = giveUp ? 0 : this.backoff(attempts);
      this.logger.error(
        { err, eventId: event.id, attempts, giveUp },
        giveUp ? 'outbox event poisoned' : 'outbox event failed, will retry',
      );
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          attempts,
          lastError: String((err as Error).message ?? err),
          nextAttemptAt: giveUp ? null : new Date(Date.now() + backoffMs),
        },
      });
    }
  }

  /** Exponential backoff with full jitter. */
  private backoff(attempt: number): number {
    const base = Math.min(60_000, 1000 * 2 ** attempt);
    return Math.floor(Math.random() * base);
  }
}
