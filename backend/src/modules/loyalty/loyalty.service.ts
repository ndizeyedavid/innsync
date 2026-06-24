import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { OnEvent } from '@nestjs/event-emitter';
import { LoyaltyTier, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { EventBus } from 'src/infrastructure/events/event-bus.service';
import {
  CheckoutCompletedPayload,
  OrderCompletedPayload,
} from 'src/infrastructure/events/domain-events';

/**
 * Loyalty is fully ours. We award points on order/checkout events and
 * compute tier from total points. Redemptions debit the ledger.
 */
@Injectable()
export class LoyaltyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventBus,
  ) {}

  async getStatus(userId: string) {
    const profile = await this.prisma.guestProfile.findUnique({ where: { userId } });
    if (!profile) return { tier: LoyaltyTier.BRONZE, points: 0 };
    return { tier: profile.loyaltyTier, points: profile.loyaltyPoints };
  }

  async history(userId: string, limit = 30) {
    return this.prisma.loyaltyLedgerEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async award(userId: string, points: number, reason: string, metadata?: Prisma.InputJsonValue) {
    await this.prisma.$transaction(async (tx) => {
      await tx.loyaltyLedgerEntry.create({
        data: { id: createId(), userId, pointsDelta: points, reason, metadata },
      });
      const profile = await tx.guestProfile.findUnique({ where: { userId } });
      if (!profile) return;
      const next = profile.loyaltyPoints + points;
      const tier = computeTier(next);
      await tx.guestProfile.update({
        where: { userId },
        data: { loyaltyPoints: next, loyaltyTier: tier },
      });
    });
    this.events.emit('loyalty.points_awarded', { userId, points, reason });
  }

  @OnEvent('order.completed')
  async onOrderCompleted(p: OrderCompletedPayload) {
    if (p.totalCents <= 0) return;
    await this.award(p.userId, Math.floor(p.totalCents / 100), 'order', { orderId: p.orderId } as Prisma.InputJsonValue);
  }

  @OnEvent('checkout.completed')
  async onCheckoutCompleted(p: CheckoutCompletedPayload) {
    // 5% of total as loyalty points
    const points = Math.floor((p.totalCents / 100) * 0.05);
    if (points > 0) {
      await this.award(p.userId, points, 'stay', { stayId: p.stayId } as Prisma.InputJsonValue);
    }
  }
}

function computeTier(points: number): LoyaltyTier {
  if (points >= 10_000) return LoyaltyTier.PLATINUM;
  if (points >= 5_000) return LoyaltyTier.GOLD;
  if (points >= 1_500) return LoyaltyTier.SILVER;
  return LoyaltyTier.BRONZE;
}
