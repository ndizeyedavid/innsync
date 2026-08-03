import { Global, Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';

/**
 * Observability primitives. Tracing is set up via the OpenTelemetry SDK
 * loaded as the very first import in main.ts (production builds). This
 * module exposes Prometheus metrics.
 */
@Global()
@Module({
  controllers: [MetricsController],
  providers: [],
  exports: [],
})
export class ObservabilityModule {}
