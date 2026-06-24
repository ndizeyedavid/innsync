import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { Idempotent } from 'src/common/decorators/idempotent.decorator';
import { IdempotencyInterceptor } from 'src/common/interceptors/idempotency.interceptor';
import { OrderResponseDto } from './dto/order.dto';
import { PlaceOrderDto } from './dto/place-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseInterceptors(IdempotencyInterceptor)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @Idempotent()
  @ApiOperation({ summary: 'Place a new order (idempotent — requires Idempotency-Key header)' })
  async place(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PlaceOrderDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ): Promise<OrderResponseDto> {
    const order = await this.orders.placeOrder(user.sub, dto, idempotencyKey);
    return OrderResponseDto.from(order);
  }

  @Get()
  @ApiOperation({ summary: 'List the caller’s orders (active or all)' })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: 'active' | 'all',
    @Query('limit') limit = '20',
  ): Promise<OrderResponseDto[]> {
    const orders = await this.orders.listMine(user.sub, {
      active: status === 'active',
      limit: Math.min(100, parseInt(limit, 10) || 20),
    });
    return orders.map((o) => OrderResponseDto.from(o));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single order' })
  async getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<OrderResponseDto> {
    const order = await this.orders.getOrder(user.sub, id);
    return OrderResponseDto.from(order);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  async cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.orders.cancel(user.sub, id);
  }
}
