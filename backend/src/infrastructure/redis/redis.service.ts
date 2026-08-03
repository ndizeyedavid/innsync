import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

export const REDIS_OPTIONS = Symbol('REDIS_OPTIONS');

/**
 * Thin facade over an ioredis client. Provides:
 *   - dedicated client for general K/V + caching
 *   - factory for duplicating connections (pub/sub, Socket.IO adapter)
 *
 * We deliberately don't expose ioredis directly to feature modules. If we
 * ever swap in a different client (e.g., upstash, dragonfly), only this
 * file changes.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    // Instantiate eagerly so consumers (e.g. the Socket.IO adapter, wired
    // during app.init() before onModuleInit hooks fire) always see a client.
    // ioredis connects in the background — this call is non-blocking.
    const url = this.config.getOrThrow<string>('redisUrl');
    this.client = new Redis(url, this.baseOptions());
    this.client.on('error', (err) => this.logger.error({ err }, 'redis error'));
    this.client.on('connect', () => this.logger.log('Redis connected'));
  }

  async onModuleInit(): Promise<void> {
    await this.client.ping();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit();
  }

  /** Get the shared client. */
  get raw(): Redis {
    return this.client;
  }

  /**
   * For pub/sub and Socket.IO, ioredis requires dedicated connections.
   * Each call returns a fresh client sharing the same connection settings.
   */
  duplicate(): Redis {
    return this.client.duplicate();
  }

  // ─── Higher-level helpers ─────────────────────────────────────────

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, payload, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, payload);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.del(...keys);
  }

  /**
   * Best-effort distributed lock (Redlock-light).
   *
   * Returns a release function on success, or null if not acquired.
   * Callers MUST release in a finally block.
   */
  async acquireLock(key: string, ttlMs: number): Promise<(() => Promise<void>) | null> {
    const token = `${Date.now()}-${Math.random()}`;
    const got = await this.client.set(`lock:${key}`, token, 'PX', ttlMs, 'NX');
    if (got !== 'OK') return null;
    return async () => {
      // Lua: only release if we still own it
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else return 0 end`;
      await this.client.eval(script, 1, `lock:${key}`, token);
    };
  }

  private baseOptions(): RedisOptions {
    return {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      retryStrategy: (times) => Math.min(times * 100, 2000),
    };
  }
}
