import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { GuestInfoDto } from './dto/guest-info.dto';
import { GuestsService } from './guests.service';

@ApiTags('guests')
@ApiBearerAuth()
@Controller('reservations/:stayId')
export class GuestsController {
  constructor(private readonly guests: GuestsService) {}

  @Post('guest-info')
  async submitGuestInfo(
    @CurrentUser() user: AuthenticatedUser,
    @Param('stayId') stayId: string,
    @Body() dto: GuestInfoDto,
  ) {
    return this.guests.updateGuestInfo(user.sub, stayId, dto);
  }
}
