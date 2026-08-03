import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoomCategory } from 'src/hospitality/domain/models/room.model';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Get()
  list(
    @Query('hotelId') hotelId = 'demo-hotel',
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
    @Query('category') category?: RoomCategory,
  ) {
    return this.rooms.search(
      hotelId,
      checkIn ? new Date(checkIn) : new Date(),
      checkOut ? new Date(checkOut) : new Date(Date.now() + 86_400_000),
      category,
    );
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.rooms.getById(id);
  }
}
