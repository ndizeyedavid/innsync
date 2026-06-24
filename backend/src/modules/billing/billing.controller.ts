import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { BillingService } from './billing.service';

class CreateDisputeDto {
  @IsString() stayId!: string;
  @IsOptional() @IsString() folioLineId?: string;
  @IsOptional() @IsInt() @Min(0) amountCents?: number;
  @IsString() @MaxLength(600) reason!: string;
}

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('invoices')
  @ApiOperation({ summary: 'List invoices for the authenticated guest' })
  listInvoices(
    @CurrentUser() user: AuthenticatedUser,
    @Query('skip') skip = '0',
    @Query('take') take = '50',
  ) {
    return this.billing.listInvoices(user.sub, { skip: parseInt(skip, 10), take: parseInt(take, 10) });
  }

  @Get('folio/:stayId')
  folio(
    @CurrentUser() user: AuthenticatedUser,
    @Param('stayId') stayId: string,
    @Query('forceRefresh') forceRefresh?: string,
  ) {
    return this.billing.getFolio(user.sub, stayId, {
      forceRefresh: forceRefresh === 'true',
    });
  }

  @Post('disputes')
  dispute(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDisputeDto) {
    return this.billing.lodgeDispute(user.sub, dto);
  }
}
