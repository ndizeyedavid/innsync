import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Outbox writes.
 *
 * Always call .write() from WITHIN the business transaction so the event row
 * lands atomically with the data change. The OutboxPublisher polls afterwards.
 *
 * Example:
 *   await prisma.$transaction(async (tx) => {
 *     await tx.order.create({ ... });
 *     await outbox.write(tx, { aggregateId, aggregateType: 'Order', eventType: 'order.placed', payload });
 *   });
 */
@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Append an event to the outbox using the provided transactional client.
   * Falls back to the global client only when no transaction is in play —
   * which should be the exception, not the rule.
   */
  async write(
    tx: Prisma.TransactionClient | PrismaService,
    input: {
      aggregateId: string;
      aggregateType: string;
      eventType: string;
      payload: Prisma.InputJsonValue;
    },
  ): Promise<void> {
    await tx.outboxEvent.create({
      data: {
        id: createId(),
        aggregateId: input.aggregateId,
        aggregateType: input.aggregateType,
        eventType: input.eventType,
        payload: input.payload,
        nextAttemptAt: new Date(),
      },
    });
  }
}
