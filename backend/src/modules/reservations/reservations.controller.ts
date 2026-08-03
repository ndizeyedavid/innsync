import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { StayOwnershipGuard } from 'src/common/guards/stay-ownership.guard';
import { ReservationsService } from './reservations.service';
import { CreateStayDto } from './dto/create-stay.dto';

class LinkReservationDto {
  @IsString() @MaxLength(100)
  confirmationNumber!: string;

  @IsOptional() @IsString() @MaxLength(200)
  email?: string;

  @IsOptional() @IsString() @MaxLength(50)
  phone?: string;
}

class ListReservationsQuery {
  @IsOptional() @Type(() => Number) skip = 0;
  @IsOptional() @Type(() => Number) take = 20;
}

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservations: ReservationsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: ListReservationsQuery) {
    return this.reservations.listMine(user.sub, query.skip, query.take);
  }

  @Post()
  @ApiOperation({ summary: 'Create a draft stay (from the guest-info flow)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateStayDto) {
    return this.reservations.createStay(user.sub, dto);
  }

  @Post('link')
  @ApiOperation({ summary: 'Link an existing reservation by confirmation number' })
  link(@CurrentUser() user: AuthenticatedUser, @Body() dto: LinkReservationDto) {
    return this.reservations.linkReservation(user.sub, dto.confirmationNumber, dto.email, dto.phone);
  }

  @Get(':id')
  @UseGuards(StayOwnershipGuard)
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.reservations.getMine(user.sub, id);
  }

  @Post(':id/cancel')
  @UseGuards(StayOwnershipGuard)
  @ApiOperation({ summary: 'Cancel a reservation' })
  cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.reservations.cancel(user.sub, id);
  }

  @Post(':id/check-in')
  @UseGuards(StayOwnershipGuard)
  checkIn(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.reservations.checkIn(user.sub, id);
  }
}
