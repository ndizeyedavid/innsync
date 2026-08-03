import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

/**
 * Append-only analytics event log. Schema discipline lives in the type
 * unions below: adding a new event means extending these maps, which forces
 * downstream code to know about it.
 *
 * Storage: Postgres today (cheap; queryable). The `analytics_events` table
 * is partitioned by month in production. An async mirror to S3 (parquet)
 * is the ML pipeline's source of truth.
 */

export type AnalyticsEventName =
  | 'menu.item.viewed'
  | 'menu.item.added_to_cart'
  | 'order.placed'
  | 'order.delivered'
  | 'activity.viewed'
  | 'activity.booked'
  | 'digital_key.unlock'
  | 'session.heartbeat';

export interface AnalyticsPayloads {
  'menu.item.viewed': { itemId: string; category: string; dwellMs?: number };
  'menu.item.added_to_cart': { itemId: string; quantity: number };
  'order.placed': { orderId: string; totalCents: number; itemCount: number };
  'order.delivered': { orderId: string; minutesFromPlaced: number };
  'activity.viewed': { activityId: string; day: number };
  'activity.booked': { activityId: string; vibes?: string[] };
  'digital_key.unlock': { method: 'BLE' | 'PIN' | 'NFC'; result: 'SUCCESS' | 'FAILED' | 'TIMEOUT' };
  'session.heartbeat': { route: string };
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async track<E extends AnalyticsEventName>(
    userId: string | null,
    event: E,
    properties: AnalyticsPayloads[E],
    sessionId?: string,
  ): Promise<void> {
    await this.prisma.analyticsEvent.create({
      data: {
        id: createId(),
        userId,
        eventType: event,
        properties: properties as unknown as object,
        sessionId,
      },
    });
  }
}
