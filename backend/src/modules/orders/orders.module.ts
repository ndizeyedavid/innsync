import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OUTBOX_HANDLERS } from 'src/infrastructure/outbox/outbox.publisher';
import { MenuModule } from 'src/modules/menu/menu.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { OrdersOutboxHandler } from './orders.outbox-handler';

/**
 * Orders bundles:
 *   - controller (REST)
 *   - service (use-case logic)
 *   - gateway (WebSocket fan-out)
 *   - outbox handler (HMS dispatcher) — registered into the OUTBOX_HANDLERS
 *     collection so the global publisher picks it up.
 */
@Module({
  imports: [JwtModule.register({}), MenuModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersGateway,
    OrdersOutboxHandler,
    {
      provide: OUTBOX_HANDLERS,
      useFactory: (h: OrdersOutboxHandler) => [h],
      inject: [OrdersOutboxHandler],
    },
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
