import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { ItineraryService } from './itinerary.service';

class UpdateItineraryDto {
  @IsOptional() @IsString() startTime?: string;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}

@ApiTags('itinerary')
@ApiBearerAuth()
@Controller('itinerary')
export class ItineraryController {
  constructor(private readonly itinerary: ItineraryService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query('stayId') stayId: string) {
    return this.itinerary.getForStay(user.sub, stayId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an itinerary item' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateItineraryDto,
  ) {
    return this.itinerary.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an itinerary item' })
  cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.itinerary.cancel(user.sub, id);
  }

  @Post('activities/:id/book')
  book(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') activityId: string,
    @Query('stayId') stayId: string,
  ) {
    return this.itinerary.bookActivity(user.sub, stayId, activityId);
  }
}
