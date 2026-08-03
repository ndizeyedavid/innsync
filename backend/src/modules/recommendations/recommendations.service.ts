import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ACTIVITY_PROVIDER } from 'src/hospitality/tokens';
import { ActivityProvider } from 'src/hospitality/domain/providers/activity.provider';

/**
 * Recommendations.
 *
 * Strategy pattern: today, a rule engine. Tomorrow, an HTTP call to a
 * model service. The controller doesn't change.
 */
export interface RecommendationStrategy {
  itineraryForGuest(userId: string, stayId: string): Promise<{ activityId: string; score: number; reason: string }[]>;
  popular(): Promise<{ activityId: string; score: number; reason: string }[]>;
}

@Injectable()
export class RuleBasedRecommender implements RecommendationStrategy {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ACTIVITY_PROVIDER) private readonly activities: ActivityProvider,
  ) {}

  async itineraryForGuest(userId: string, stayId: string) {
    const [profile, stay] = await Promise.all([
      this.prisma.guestProfile.findUnique({ where: { userId } }),
      this.prisma.guestStay.findUnique({ where: { id: stayId } }),
    ]);
    const vibes = new Set([
      ...(profile?.preferredVibes ?? []),
      ...(stay?.itineraryVibes ?? []),
    ]);
    const catalog = await this.activities.search({ hotelId: stay?.hotelId ?? 'demo-hotel' });
    if (!catalog.ok) return [];

    return catalog.data
      .map((a) => {
        const score = scoreActivity(a.title + ' ' + a.description, vibes);
        return {
          activityId: a.externalId,
          score,
          reason: score > 0 ? 'matches your selected vibes' : 'broadly popular',
        };
      })
      .sort((x, y) => y.score - x.score)
      .slice(0, 5);
  }

  async popular() {
    const catalog = await this.activities.search({ hotelId: 'demo-hotel' });
    if (!catalog.ok) return [];
    return catalog.data
      .map((a) => ({ activityId: a.externalId, score: 1, reason: 'popular' }))
      .slice(0, 10);
  }
}

function scoreActivity(text: string, vibes: Set<string>): number {
  let s = 0;
  const lower = text.toLowerCase();
  for (const v of vibes) if (lower.includes(v.split('-').join(' '))) s += 1;
  return s;
}

@Injectable()
export class RecommendationsService {
  constructor(private readonly strategy: RuleBasedRecommender) {}
  itineraryForGuest(userId: string, stayId: string) {
    return this.strategy.itineraryForGuest(userId, stayId);
  }
  popular() {
    return this.strategy.popular();
  }
}
