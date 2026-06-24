import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import {
  RecommendationsService,
  RuleBasedRecommender,
} from './recommendations.service';
import { AnalyticsService } from './analytics.service';

@Module({
  controllers: [RecommendationsController],
  providers: [RecommendationsService, RuleBasedRecommender, AnalyticsService],
  exports: [AnalyticsService, RecommendationsService],
})
export class RecommendationsModule {}
