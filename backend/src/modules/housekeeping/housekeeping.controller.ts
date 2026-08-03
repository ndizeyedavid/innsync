import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { HousekeepingService } from './housekeeping.service';
import { HousekeepingTaskKind } from 'src/hospitality/domain/models/housekeeping.model';

class CreateHousekeepingTaskDto {
  @IsEnum(['cleaning', 'turn_down', 'towels', 'amenities', 'maintenance'])
  kind!: HousekeepingTaskKind;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  notes?: string;
}

@ApiTags('housekeeping')
@ApiBearerAuth()
@Controller('reservations/:stayId/housekeeping')
export class HousekeepingController {
  constructor(private readonly housekeeping: HousekeepingService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Param('stayId') stayId: string) {
    return this.housekeeping.listForStay(user.sub, stayId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('stayId') stayId: string,
    @Body() dto: CreateHousekeepingTaskDto,
  ) {
    return this.housekeeping.requestTask(user.sub, stayId, dto.kind, dto.notes);
  }
}
