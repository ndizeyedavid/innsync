import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderItem, OrderStatus } from '@prisma/client';

/**
 * The shape we send to the frontend. Mirrors the existing TypeScript
 * `ActiveOrder` type so the client can use it without translation.
 */
export class OrderResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() placedAt!: string;
  @ApiProperty({ required: false }) etaMinutes?: number;
  @ApiProperty({ enum: ['preparing', 'on-the-way', 'delivered', 'cancelled', 'failed', 'pending'] })
  status!: 'preparing' | 'on-the-way' | 'delivered' | 'cancelled' | 'failed' | 'pending';
  @ApiProperty() total!: number; // cents
  @ApiProperty() currency!: string;
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  items!: { name: string; quantity: number }[];

  static from(order: Order & { items: OrderItem[] }): OrderResponseDto {
    return {
      id: order.id,
      placedAt: order.placedAt.toISOString(),
      etaMinutes: order.etaMinutes ?? undefined,
      status: mapStatus(order.status),
      total: order.totalCents,
      currency: order.currency,
      items: order.items.map((i) => ({ name: i.nameSnapshot, quantity: i.quantity })),
    };
  }
}

function mapStatus(s: OrderStatus): OrderResponseDto['status'] {
  switch (s) {
    case 'PENDING_REMOTE':
      return 'pending';
    case 'PREPARING':
      return 'preparing';
    case 'ON_THE_WAY':
      return 'on-the-way';
    case 'DELIVERED':
      return 'delivered';
    case 'CANCELLED':
      return 'cancelled';
    case 'FAILED':
      return 'failed';
  }
}
