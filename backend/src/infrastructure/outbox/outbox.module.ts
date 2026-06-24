import { Global, Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { OutboxPublisher, OUTBOX_HANDLERS } from './outbox.publisher';

/**
 * The OutboxModule is global so any feature can write to the outbox in a
 * transaction. Handlers are registered by feature modules contributing
 * to the OUTBOX_HANDLERS multi-provider token.
 */
@Global()
@Module({
  providers: [
    OutboxService,
    OutboxPublisher,
    { provide: OUTBOX_HANDLERS, useValue: [] }, // base — feature modules append via OutboxRegistration helper
  ],
  exports: [OutboxService, OutboxPublisher, OUTBOX_HANDLERS],
})
export class OutboxModule {}
