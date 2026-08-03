import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@ApiBearerAuth()
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendations: RecommendationsService) {}

  @Get('itinerary')
  itinerary(@CurrentUser() user: AuthenticatedUser, @Query('stayId') stayId: string) {
    return this.recommendations.itineraryForGuest(user.sub, stayId);
  }

  @Get('personalized')
  personalized(@CurrentUser() user: AuthenticatedUser, @Query('stayId') stayId: string) {
    return this.recommendations.itineraryForGuest(user.sub, stayId);
  }

  @Get('popular')
  popular(@CurrentUser() user: AuthenticatedUser) {
    return this.recommendations.popular();
  }
}
