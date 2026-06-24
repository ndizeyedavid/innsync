import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { LoyaltyService } from './loyalty.service';

@ApiTags('loyalty')
@ApiBearerAuth()
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyalty: LoyaltyService) {}

  @Get()
  status(@CurrentUser() user: AuthenticatedUser) {
    return this.loyalty.getStatus(user.sub);
  }

  @Get('points')
  points(@CurrentUser() user: AuthenticatedUser) {
    return this.loyalty.getStatus(user.sub);
  }

  @Get('rewards')
  rewards(@CurrentUser() user: AuthenticatedUser) {
    return this.loyalty.history(user.sub, 50);
  }

  @Get('history')
  history(@CurrentUser() user: AuthenticatedUser, @Query('limit') limit = '30') {
    return this.loyalty.history(user.sub, parseInt(limit, 10));
  }
}
