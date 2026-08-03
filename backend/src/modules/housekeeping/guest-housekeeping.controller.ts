import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { HousekeepingService } from './housekeeping.service';
import { HousekeepingTaskKind } from 'src/hospitality/domain/models/housekeeping.model';

class RequestHousekeepingDto {
  @IsString() @MaxLength(100)
  stayId!: string;

  @IsEnum(['cleaning', 'turn_down', 'towels', 'amenities', 'maintenance'])
  type!: HousekeepingTaskKind;

  @IsOptional() @IsString() @MaxLength(400)
  notes?: string;
}

@ApiTags('housekeeping')
@ApiBearerAuth()
@Controller('housekeeping')
export class GuestHousekeepingController {
  constructor(private readonly housekeeping: HousekeepingService) {}

  @Post('request')
  @ApiOperation({ summary: 'Request housekeeping service (flat mobile route)' })
  request(@CurrentUser() user: AuthenticatedUser, @Body() dto: RequestHousekeepingDto) {
    return this.housekeeping.requestTask(user.sub, dto.stayId, dto.type, dto.notes);
  }

  @Get('status/:stayId')
  @ApiOperation({ summary: 'Get housekeeping status for a stay (flat mobile route)' })
  status(@CurrentUser() user: AuthenticatedUser, @Param('stayId') stayId: string) {
    return this.housekeeping.listForStay(user.sub, stayId);
  }
}
