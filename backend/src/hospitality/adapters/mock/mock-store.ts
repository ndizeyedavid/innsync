import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { AppConfig } from 'src/config/configuration';

/**
 * In-memory + Redis-backed store shared across mock providers.
 *
 * Why Redis: dev usually runs multiple processes (api, jobs, tests).
 * Backing the mock with Redis means data created via one process is visible
 * to others without each having its own RAM map.
 *
 * Why also in-memory: tests want isolation — each test resets `useMemoryOnly`
 * so its mutations don't leak into others.
 */
@Injectable()
export class MockStore implements OnModuleInit {
  private readonly logger = new Logger(MockStore.name);
  private memory = new Map<string, unknown>();
  private useMemoryOnly = false;

  constructor(
    private readonly redis: RedisService,
    private readonly config: AppConfig,
  ) {}

  onModuleInit(): void {
    // Tests may set USE_MEMORY_ONLY_MOCK=true to skip Redis altogether.
    this.useMemoryOnly = process.env.USE_MEMORY_ONLY_MOCK === 'true';
  }

  /** Simulate upstream latency configured via env. */
  async delay(): Promise<void> {
    if (this.config.mock.latencyMs > 0) {
      await new Promise((r) => setTimeout(r, this.config.mock.latencyMs));
    }
  }

  /** Simulate failures via env: MOCK_FAILURE_RATE=0.1, MOCK_OUTAGES=reservations,folios. */
  shouldFail(aggregate: string): boolean {
    if (this.config.mock.outages.includes(aggregate)) return true;
    return Math.random() < this.config.mock.failureRate;
  }

  async get<T>(ns: string, id: string): Promise<T | undefined> {
    const key = `mock:${ns}:${id}`;
    if (this.useMemoryOnly) return this.memory.get(key) as T | undefined;
    return (await this.redis.getJson<T>(key)) ?? undefined;
  }

  async list<T>(ns: string): Promise<T[]> {
    if (this.useMemoryOnly) {
      const out: T[] = [];
      for (const [k, v] of this.memory) {
        if (k.startsWith(`mock:${ns}:`)) out.push(v as T);
      }
      return out;
    }
    const keys = await this.redis.raw.keys(`mock:${ns}:*`);
    if (keys.length === 0) return [];
    const raws = await this.redis.raw.mget(...keys);
    return raws.flatMap((r) => (r ? [JSON.parse(r) as T] : []));
  }

  async put<T>(ns: string, id: string, value: T, ttlSeconds?: number): Promise<void> {
    const key = `mock:${ns}:${id}`;
    if (this.useMemoryOnly) {
      this.memory.set(key, value);
      return;
    }
    await this.redis.setJson(key, value, ttlSeconds);
  }

  async del(ns: string, id: string): Promise<void> {
    const key = `mock:${ns}:${id}`;
    if (this.useMemoryOnly) {
      this.memory.delete(key);
      return;
    }
    await this.redis.del(key);
  }

  /** Test hook: wipe all mock state. Safe in dev; never call in production. */
  async reset(): Promise<void> {
    if (this.useMemoryOnly) {
      this.memory.clear();
      return;
    }
    const keys = await this.redis.raw.keys('mock:*');
    if (keys.length > 0) await this.redis.raw.del(...keys);
  }
}
