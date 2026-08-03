import { Controller, Get, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MenuItem, MenuService } from './menu.service';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menu: MenuService) {}

  @Get()
  list(
    @Query('hotelId') hotelId: string,
    @Query('category') category?: MenuItem['category'],
  ) {
    return this.menu.list(hotelId, category);
  }
}
