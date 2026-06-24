import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { Public } from 'src/common/decorators/public.decorator';

/**
 * Health probes:
 *   - /healthz   — liveness:  is the process running?
 *   - /readyz    — readiness: can we serve traffic? (DB + Redis reachable)
 *
 * Both are @Public to avoid the auth dependency in cluster probes.
 */
@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly db: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get('healthz')
  @Public()
  liveness() {
    return { status: 'ok' };
  }

  @Get('readyz')
  @Public()
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('db', this.prisma),
      async () => {
        const pong = await this.redis.raw.ping();
        return { redis: { status: pong === 'PONG' ? 'up' : 'down' } };
      },
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
      () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }
}
