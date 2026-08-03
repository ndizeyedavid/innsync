import { Injectable } from '@nestjs/common';
import { RoomProvider } from '../../domain/providers/room.provider';
import { Room, RoomQuery } from '../../domain/models/room.model';
import { err, ok, ProviderResult } from '../../domain/provider-result';
import { MockStore } from './mock-store';

/**
 * The mock room catalog is seeded from a static fixture set so it's stable
 * across restarts. (Reservations are dynamic; rooms are essentially a hotel
 * config.) Modeled after the frontend mockData.ts rooms.
 */
const FIXTURE_ROOMS: Room[] = [
  {
    externalId: 'ROOM-garden-twin',
    hotelId: 'demo-hotel',
    name: 'Garden Twin',
    category: 'Garden',
    size: '32 m²',
    beds: '2 single',
    view: 'Tropical garden',
    priceCents: 22_000,
    currency: 'USD',
    image: 'https://images.innsync.dev/rooms/garden-twin.jpg',
    perks: ['Walk-in shower', 'Espresso bar', 'Garden terrace'],
  },
  {
    externalId: 'ROOM-ocean-suite',
    hotelId: 'demo-hotel',
    name: 'Ocean Suite',
    category: 'Ocean',
    size: '48 m²',
    beds: '1 king',
    view: 'Panoramic ocean',
    priceCents: 36_000,
    currency: 'USD',
    image: 'https://images.innsync.dev/rooms/ocean-suite.jpg',
    perks: ['Plunge pool', 'Sunset balcony', 'Pillow menu'],
  },
  {
    externalId: 'ROOM-overwater-villa',
    hotelId: 'demo-hotel',
    name: 'Overwater Villa',
    category: 'Villa',
    size: '78 m²',
    beds: '1 king + sofa',
    view: 'Lagoon, direct access',
    priceCents: 78_000,
    currency: 'USD',
    image: 'https://images.innsync.dev/rooms/villa.jpg',
    perks: ['Private deck', 'Butler service', 'Coral viewing floor'],
  },
];

@Injectable()
export class MockRoomProvider implements RoomProvider {
  private readonly NS = 'room';

  constructor(private readonly store: MockStore) {}

  async search(query: RoomQuery): Promise<ProviderResult<Room[]>> {
    await this.store.delay();
    if (this.store.shouldFail('rooms')) return err('unavailable', undefined, []);
    const all = FIXTURE_ROOMS.filter((r) => r.hotelId === query.hotelId);
    const filtered = query.category ? all.filter((r) => r.category === query.category) : all;
    return ok(filtered);
  }

  async getById(externalId: string): Promise<ProviderResult<Room>> {
    await this.store.delay();
    if (this.store.shouldFail('rooms')) return err('unavailable');
    const r = FIXTURE_ROOMS.find((x) => x.externalId === externalId);
    return r ? ok(r) : err('not_found');
  }

  async assignToReservation(
    externalReservationId: string,
    externalRoomId: string,
  ): Promise<ProviderResult<void>> {
    await this.store.delay();
    if (this.store.shouldFail('rooms')) return err('unavailable');
    const room = FIXTURE_ROOMS.find((r) => r.externalId === externalRoomId);
    if (!room) return err('not_found');
    // Persist the assignment alongside the reservation snapshot
    const res = await this.store.get<{ roomExternalId: string | null }>('reservation', externalReservationId);
    if (!res) return err('not_found');
    res.roomExternalId = externalRoomId;
    await this.store.put('reservation', externalReservationId, res);
    return ok(undefined);
  }
}
