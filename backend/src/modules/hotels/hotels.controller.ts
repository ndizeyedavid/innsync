import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { HotelsService } from './hotels.service';

@ApiTags('hotels')
@Public()
@Controller('hotels')
export class HotelsController {
  constructor(private readonly svc: HotelsService) {}

  @Get()
  @ApiOperation({ summary: 'List all hotels' })
  async list(@Query('search') search?: string, @Query('city') city?: string) {
    return this.svc.list(search, city);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hotel by id' })
  async getOne(@Param('id') id: string) {
    return this.svc.getOne(id);
  }

  @Get(':id/rooms')
  @ApiOperation({ summary: 'List rooms for a hotel' })
  async getRooms(@Param('id') id: string) {
    return this.svc.getRooms(id);
  }
}
