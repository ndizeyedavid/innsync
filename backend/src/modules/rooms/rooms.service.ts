import { Inject, Injectable } from '@nestjs/common';
import { ROOM_PROVIDER } from 'src/hospitality/tokens';
import { RoomProvider } from 'src/hospitality/domain/providers/room.provider';
import { RoomCategory } from 'src/hospitality/domain/models/room.model';
import { NotFoundError } from 'src/common/errors/domain.errors';

@Injectable()
export class RoomsService {
  constructor(@Inject(ROOM_PROVIDER) private readonly rooms: RoomProvider) {}

  async search(hotelId: string, checkIn: Date, checkOut: Date, category?: RoomCategory) {
    const r = await this.rooms.search({ hotelId, checkIn, checkOut, category });
    return r.ok ? r.data : [];
  }

  async getById(id: string) {
    const r = await this.rooms.getById(id);
    if (!r.ok) throw new NotFoundError('Room not found');
    return r.data;
  }
}
