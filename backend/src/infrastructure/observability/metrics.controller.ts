import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { Registry, collectDefaultMetrics, Histogram, Counter, Gauge } from 'prom-client';
import { Public } from 'src/common/decorators/public.decorator';

/**
 * Prometheus exposition endpoint.
 *
 * In production, this route is reachable only from inside the cluster
 * (gated at the ingress / network layer — NOT exposed publicly).
 */

export const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

export const providerCallDuration = new Histogram({
  name: 'provider_call_duration_seconds',
  help: 'Hospitality provider call duration',
  labelNames: ['provider', 'operation', 'outcome'], // outcome: live|cache|error
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

export const outboxLag = new Gauge({
  name: 'outbox_publish_lag_seconds',
  help: 'Age of the oldest unpublished outbox event',
  registers: [metricsRegistry],
});

export const orderTransitions = new Counter({
  name: 'order_status_transitions_total',
  help: 'Order status transitions',
  labelNames: ['from', 'to'],
  registers: [metricsRegistry],
});

export const wsConnections = new Gauge({
  name: 'websocket_connections',
  help: 'Active websocket connections',
  labelNames: ['namespace'],
  registers: [metricsRegistry],
});

@Controller('metrics')
export class MetricsController {
  @Get()
  @Public()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  async metrics(@Res() res: Response): Promise<void> {
    res.send(await metricsRegistry.metrics());
  }
}
