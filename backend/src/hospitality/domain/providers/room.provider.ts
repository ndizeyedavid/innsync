import { ProviderResult } from '../provider-result';
import { Room, RoomQuery } from '../models/room.model';

export interface RoomProvider {
  search(query: RoomQuery): Promise<ProviderResult<Room[]>>;
  getById(externalId: string): Promise<ProviderResult<Room>>;
  assignToReservation(
    externalReservationId: string,
    externalRoomId: string,
  ): Promise<ProviderResult<void>>;
}
