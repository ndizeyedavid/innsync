import { Body, Controller, Delete, Get, Headers, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { Idempotent } from 'src/common/decorators/idempotent.decorator';
import { IdempotencyInterceptor } from 'src/common/interceptors/idempotency.interceptor';
import { PaymentsService } from './payments.service';

class AttachMethodDto {
  @IsString() providerToken!: string;
  @IsOptional() makeDefault?: boolean;
}

class AuthorizeDto {
  @IsString() paymentMethodId!: string;
  @IsInt() @Min(1) amountCents!: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() stayId?: string;
}

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseInterceptors(IdempotencyInterceptor)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get('methods')
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.payments.listMethods(user.sub);
  }

  @Post('methods')
  @Idempotent()
  attach(@CurrentUser() user: AuthenticatedUser, @Body() dto: AttachMethodDto) {
    return this.payments.attachMethod(user.sub, dto.providerToken, dto.makeDefault);
  }

  @Delete('methods/:id')
  @ApiOperation({ summary: 'Remove a saved payment method' })
  delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.payments.deleteMethod(user.sub, id);
  }

  @Post('authorize')
  @Idempotent()
  authorize(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AuthorizeDto,
    @Headers('idempotency-key') key: string,
  ) {
    return this.payments.authorize({ ...dto, userId: user.sub, idempotencyKey: key });
  }
}
