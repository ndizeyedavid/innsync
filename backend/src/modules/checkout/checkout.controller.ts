import { Controller, Headers, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { Idempotent } from 'src/common/decorators/idempotent.decorator';
import { IdempotencyInterceptor } from 'src/common/interceptors/idempotency.interceptor';
import { CheckoutService } from './checkout.service';

@ApiTags('checkout')
@ApiBearerAuth()
@Controller('checkout')
@UseInterceptors(IdempotencyInterceptor)
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post(':stayId/express')
  @Idempotent()
  express(
    @CurrentUser() user: AuthenticatedUser,
    @Param('stayId') stayId: string,
    @Headers('idempotency-key') _key: string,
  ) {
    return this.checkout.expressCheckout(user.sub, stayId);
  }
}
