import { Injectable } from '@nestjs/common';
import { OutboxEvent } from '@prisma/client';
import { OutboxHandler } from 'src/infrastructure/outbox/outbox.publisher';
import { OrdersService } from './orders.service';

/**
 * Bridges outbox events back into the OrdersService. Registered as an
 * OUTBOX_HANDLERS contribution from this module.
 */
@Injectable()
export class OrdersOutboxHandler implements OutboxHandler {
  constructor(private readonly orders: OrdersService) {}

  match(event: Pick<OutboxEvent, 'aggregateType' | 'eventType'>): boolean {
    return event.aggregateType === 'Order' && event.eventType === 'order.dispatch_to_hms';
  }

  async handle(event: OutboxEvent): Promise<void> {
    await this.orders.dispatchToHms(
      event.payload as unknown as Parameters<OrdersService['dispatchToHms']>[0],
    );
  }
}
