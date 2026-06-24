import { Injectable } from '@nestjs/common';
import { ActivityProvider } from '../../domain/providers/activity.provider';
import { Activity, ActivityQuery } from '../../domain/models/activity.model';
import { err, ok, ProviderResult } from '../../domain/provider-result';
import { MockStore } from './mock-store';

/**
 * Static curated catalog matching the frontend's mockData.ts activities.
 * Permit-required entries track their remaining permits in the store so
 * reservePermit() actually decrements.
 */
const FIXTURE_ACTIVITIES: Activity[] = [
  {
    externalId: 'ACT-sunrise-yoga',
    hotelId: 'demo-hotel',
    day: 1,
    startTime: '06:30',
    endTime: '07:30',
    title: 'Sunrise yoga on the deck',
    location: 'East lawn',
    description: 'Beach sand still cool, sun coming up over the lagoon.',
    imageUrl: 'https://images.innsync.dev/activities/yoga.jpg',
    availability: 'available',
    durationMinutes: 60,
  },
  {
    externalId: 'ACT-coral-dive',
    hotelId: 'demo-hotel',
    day: 2,
    startTime: '09:00',
    endTime: '12:00',
    title: 'Guided coral reef dive',
    location: 'Lagoon north shelf',
    description: 'Permit-controlled; max 12 divers per day.',
    imageUrl: 'https://images.innsync.dev/activities/dive.jpg',
    availability: 'permit-required',
    permitsRemaining: 4,
    durationMinutes: 180,
    priceCents: 9_500,
    currency: 'USD',
  },
  {
    externalId: 'ACT-vineyard-tasting',
    hotelId: 'demo-hotel',
    day: 3,
    startTime: '17:00',
    endTime: '19:00',
    title: 'Hillside vineyard tasting',
    location: 'Off-property estate',
    description: 'Six pours, paired charcuterie. Transport included.',
    imageUrl: 'https://images.innsync.dev/activities/vineyard.jpg',
    availability: 'available',
    durationMinutes: 120,
    priceCents: 11_500,
    currency: 'USD',
  },
];

@Injectable()
export class MockActivityProvider implements ActivityProvider {
  private readonly NS = 'activity';

  constructor(private readonly store: MockStore) {}

  async search(query: ActivityQuery): Promise<ProviderResult<Activity[]>> {
    await this.store.delay();
    if (this.store.shouldFail('activities')) return err('unavailable', undefined, []);
    const filtered = FIXTURE_ACTIVITIES.filter(
      (a) => a.hotelId === query.hotelId && (!query.day || a.day === query.day),
    );
    // Overlay any per-id state (decremented permits)
    const hydrated = await Promise.all(
      filtered.map(async (a) => {
        const live = await this.store.get<Partial<Activity>>(this.NS, a.externalId);
        return { ...a, ...(live ?? {}) };
      }),
    );
    return ok(hydrated);
  }

  async getById(externalId: string): Promise<ProviderResult<Activity>> {
    await this.store.delay();
    if (this.store.shouldFail('activities')) return err('unavailable');
    const base = FIXTURE_ACTIVITIES.find((a) => a.externalId === externalId);
    if (!base) return err('not_found');
    const live = await this.store.get<Partial<Activity>>(this.NS, externalId);
    return ok({ ...base, ...(live ?? {}) });
  }

  async reservePermit(externalId: string): Promise<ProviderResult<Activity>> {
    await this.store.delay();
    if (this.store.shouldFail('activities')) return err('unavailable');
    const base = FIXTURE_ACTIVITIES.find((a) => a.externalId === externalId);
    if (!base) return err('not_found');
    const live = (await this.store.get<Partial<Activity>>(this.NS, externalId)) ?? {};
    const remaining =
      live.permitsRemaining ?? base.permitsRemaining ?? (base.availability === 'available' ? Infinity : 0);
    if (remaining <= 0) return err('conflict');
    const next = remaining === Infinity ? Infinity : remaining - 1;
    const patch: Partial<Activity> = {
      permitsRemaining: next === Infinity ? undefined : next,
      availability: next === 0 ? 'fully-booked' : base.availability,
    };
    await this.store.put(this.NS, externalId, { ...live, ...patch });
    return ok({ ...base, ...live, ...patch });
  }
}
