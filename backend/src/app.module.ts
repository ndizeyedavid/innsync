import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { configuration, validateEnv } from './config/configuration';
import { AppConfigModule } from './config/config.module';

import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { EventsModule } from './infrastructure/events/events.module';
import { OutboxModule } from './infrastructure/outbox/outbox.module';
import { ObservabilityModule } from './infrastructure/observability/observability.module';

import { HospitalityModule } from './hospitality/hospitality.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GuestsModule } from './modules/guests/guests.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrdersModule } from './modules/orders/orders.module';
import { HousekeepingModule } from './modules/housekeeping/housekeeping.module';
import { BillingModule } from './modules/billing/billing.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { ItineraryModule } from './modules/itinerary/itinerary.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { DigitalKeyModule } from './modules/digital-key/digital-key.module';
import { EmailModule } from './modules/email/email.module';
import { HealthModule } from './health/health.module';
import { HotelManagerModule } from './modules/hotel-manager/hotel-manager.module';
import { HotelsModule } from './modules/hotels/hotels.module';

/**
 * Top-level module — wires the entire application.
 *
 * Composition rules:
 *   - infrastructure modules are global and provide cross-cutting services.
 *   - feature modules are NOT global; they depend on infra + hospitality only.
 *   - feature modules never import each other directly. Cross-feature coupling
 *     happens via domain events (EventEmitterModule).
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      useFactory: () => ({
        pinoHttp: {
          level: process.env.LOG_LEVEL ?? 'info',
          // Redact secrets so they never appear in any log line
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.body.password',
              'req.body.refreshToken',
              'req.body.idempotencyKey',
              '*.password',
              '*.passwordHash',
              '*.token',
              '*.refreshToken',
              '*.accessToken',
            ],
            censor: '[REDACTED]',
          },
          transport:
            process.env.NODE_ENV !== 'production'
              ? { target: 'pino-pretty', options: { singleLine: true } }
              : undefined,
        },
      }),
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.', maxListeners: 50 }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),

    AppConfigModule,

    // Infrastructure (global)
    PrismaModule,
    RedisModule,
    EmailModule,
    EventsModule,
    OutboxModule,
    ObservabilityModule,

    // Provider abstraction layer (global tokens, swappable adapters)
    HospitalityModule,

    // Feature modules
    AuthModule,
    UsersModule,
    GuestsModule,
    ReservationsModule,
    RoomsModule,
    MenuModule,
    OrdersModule,
    HousekeepingModule,
    BillingModule,
    CheckoutModule,
    ItineraryModule,
    RecommendationsModule,
    NotificationsModule,
    PaymentsModule,
    LoyaltyModule,
    DigitalKeyModule,
    HealthModule,
    HotelManagerModule,
    HotelsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
