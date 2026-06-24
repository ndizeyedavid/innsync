/**
 * Mock provider's contract test. Same suite runs against the External
 * provider in a sibling spec (against a WireMock stub of the HMS).
 */
import { reservationProviderContract } from './reservation-provider.contract';
import { MockReservationProvider } from 'src/hospitality/adapters/mock/mock-reservation.provider';
import { MockStore } from 'src/hospitality/adapters/mock/mock-store';
import { AppConfig } from 'src/config/configuration';

// In-process, no-Redis test setup. USE_MEMORY_ONLY_MOCK=true ensures the
// store keeps state in a Map for this test only.
process.env.USE_MEMORY_ONLY_MOCK = 'true';

function makeConfig(): AppConfig {
  return {
    mock: { latencyMs: 0, failureRate: 0, outages: [] },
  } as unknown as AppConfig;
}

function makeStore(): MockStore {
  const store = new MockStore({} as never, makeConfig());
  // Force the memoryOnly switch (onModuleInit reads env, but we bypass DI here)
  (store as unknown as { useMemoryOnly: boolean }).useMemoryOnly = true;
  return store;
}

reservationProviderContract('Mock', async () => {
  const store = makeStore();
  const provider = new MockReservationProvider(store);
  return {
    provider,
    reset: () => store.reset(),
  };
});
