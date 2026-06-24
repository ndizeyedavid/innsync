import { Global, Module } from '@nestjs/common';
import { AppConfig, HospitalityAggregateKey, HospitalityProviderKind } from 'src/config/configuration';

// Tokens
import {
  ACTIVITY_PROVIDER,
  FOLIO_PROVIDER,
  HOUSEKEEPING_PROVIDER,
  RESERVATION_PROVIDER,
  ROOM_PROVIDER,
  ROOM_SERVICE_PROVIDER,
} from './tokens';

// Mock implementations
import { MockStore } from './adapters/mock/mock-store';
import { MockReservationProvider } from './adapters/mock/mock-reservation.provider';
import { MockRoomProvider } from './adapters/mock/mock-room.provider';
import { MockFolioProvider } from './adapters/mock/mock-folio.provider';
import { MockRoomServiceProvider } from './adapters/mock/mock-room-service.provider';
import { MockHousekeepingProvider } from './adapters/mock/mock-housekeeping.provider';
import { MockActivityProvider } from './adapters/mock/mock-activity.provider';

// External implementations
import { ExternalHmsClient } from './adapters/external/external-hms.client';
import { ExternalReservationProvider } from './adapters/external/external-reservation.provider';
import { ExternalFolioProvider } from './adapters/external/external-folio.provider';
import { ExternalRoomServiceProvider } from './adapters/external/external-room-service.provider';

import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisService } from 'src/infrastructure/redis/redis.service';

/**
 * Wires the provider abstraction.
 *
 *   - All mock and external implementations are registered.
 *   - For each provider token, a factory picks `mock` or `external` based on
 *     env (with per-aggregate overrides). The implementation injected
 *     downstream is *only* what config selects — the other is dormant.
 *   - Switching providers requires no code change in any feature module.
 */

function pick<M, E>(
  cfg: AppConfig,
  key: HospitalityAggregateKey,
  mock: M,
  ext: E,
): M | E {
  const kind: HospitalityProviderKind = cfg.providerFor(key);
  return kind === 'external' ? ext : mock;
}

@Global()
@Module({
  providers: [
    // shared mock dependencies
    MockStore,
    MockReservationProvider,
    MockRoomProvider,
    MockFolioProvider,
    MockRoomServiceProvider,
    MockHousekeepingProvider,
    MockActivityProvider,

    // shared external dependencies
    ExternalHmsClient,
    ExternalReservationProvider,
    ExternalFolioProvider,
    ExternalRoomServiceProvider,

    // ── Provider token factories ────────────────────────────────────
    {
      provide: RESERVATION_PROVIDER,
      useFactory: (cfg: AppConfig, mock: MockReservationProvider, ext: ExternalReservationProvider) =>
        pick(cfg, 'reservations', mock, ext),
      inject: [AppConfig, MockReservationProvider, ExternalReservationProvider],
    },
    {
      provide: ROOM_PROVIDER,
      // No external room provider yet — until it exists, the global flag still
      // resolves to mock for this aggregate. Add ExternalRoomProvider here when ready.
      useFactory: (_cfg: AppConfig, mock: MockRoomProvider) => mock,
      inject: [AppConfig, MockRoomProvider],
    },
    {
      provide: FOLIO_PROVIDER,
      useFactory: (cfg: AppConfig, mock: MockFolioProvider, ext: ExternalFolioProvider) =>
        pick(cfg, 'folios', mock, ext),
      inject: [AppConfig, MockFolioProvider, ExternalFolioProvider],
    },
    {
      provide: ROOM_SERVICE_PROVIDER,
      useFactory: (cfg: AppConfig, mock: MockRoomServiceProvider, ext: ExternalRoomServiceProvider) =>
        pick(cfg, 'roomService', mock, ext),
      inject: [AppConfig, MockRoomServiceProvider, ExternalRoomServiceProvider],
    },
    {
      provide: HOUSEKEEPING_PROVIDER,
      useFactory: (_cfg: AppConfig, mock: MockHousekeepingProvider) => mock,
      inject: [AppConfig, MockHousekeepingProvider],
    },
    {
      provide: ACTIVITY_PROVIDER,
      useFactory: (_cfg: AppConfig, mock: MockActivityProvider) => mock,
      inject: [AppConfig, MockActivityProvider],
    },

    // Re-export Prisma/Redis aliases consumed by mock providers, so tests
    // can swap them with mocks if they need to.
    PrismaService,
    RedisService,
  ],
  exports: [
    RESERVATION_PROVIDER,
    ROOM_PROVIDER,
    FOLIO_PROVIDER,
    ROOM_SERVICE_PROVIDER,
    HOUSEKEEPING_PROVIDER,
    ACTIVITY_PROVIDER,
    // expose the concrete mocks for tests that want to manipulate state directly
    MockStore,
    MockFolioProvider,
    MockRoomServiceProvider,
  ],
})
export class HospitalityModule {}
