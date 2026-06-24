import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Strongly-typed app configuration.
 *
 * Single source of truth: env vars validated and parsed at boot, then exposed
 * via the AppConfig service. Any code that needs config injects AppConfig
 * rather than reading process.env directly.
 */

export type HospitalityProviderKind = 'mock' | 'external';

export type HospitalityAggregateKey =
  | 'reservations'
  | 'folios'
  | 'rooms'
  | 'roomService'
  | 'housekeeping';

export interface AppConfigShape {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  port: number;
  logLevel: string;
  corsOrigins: string[];

  databaseUrl: string;
  redisUrl: string;

  jwt: {
    algorithm: 'HS256' | 'RS256';
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  argon2: { memoryCost: number; timeCost: number };

  hospitality: {
    global: HospitalityProviderKind;
    overrides: Partial<Record<HospitalityAggregateKey, HospitalityProviderKind>>;
  };

  hms: {
    baseUrl: string;
    apiKey: string;
    timeoutMs: number;
    retryAttempts: number;
    circuitThreshold: number;
    circuitTimeoutMs: number;
  };

  mock: {
    latencyMs: number;
    failureRate: number;
    outages: string[];
  };

  throttle: { ttl: number; limit: number };
  features: { realtimeWebsockets: boolean; expressCheckout: boolean };
  observability: { otlpEndpoint: string | undefined; prometheusEnabled: boolean };

  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };

  googleClientId: string;
}

export function configuration(): AppConfigShape {
  const env = process.env;
  const provider = (env.HOSPITALITY_PROVIDER ?? 'mock').toLowerCase() as HospitalityProviderKind;
  const override = (key: string) => {
    const v = env[key];
    return v && v.length > 0 ? (v.toLowerCase() as HospitalityProviderKind) : undefined;
  };
  return {
    nodeEnv: (env.NODE_ENV as AppConfigShape['nodeEnv']) ?? 'development',
    port: parseInt(env.PORT ?? '4000', 10),
    logLevel: env.LOG_LEVEL ?? 'info',
    corsOrigins: (env.CORS_ORIGINS ?? 'http://localhost:3000').split(',').map((s) => s.trim()),

    databaseUrl: env.DATABASE_URL ?? '',
    redisUrl: env.REDIS_URL ?? 'redis://localhost:6379',

    jwt: {
      algorithm: (env.JWT_ALGORITHM as 'HS256' | 'RS256') ?? 'HS256',
      accessSecret: env.JWT_ACCESS_SECRET ?? '',
      refreshSecret: env.JWT_REFRESH_SECRET ?? '',
      accessTtl: env.JWT_ACCESS_TTL ?? '15m',
      refreshTtl: env.JWT_REFRESH_TTL ?? '30d',
    },
    argon2: {
      memoryCost: parseInt(env.ARGON2_MEMORY_COST ?? '19456', 10),
      timeCost: parseInt(env.ARGON2_TIME_COST ?? '2', 10),
    },

    hospitality: {
      global: provider,
      overrides: {
        reservations: override('HOSPITALITY_PROVIDER_RESERVATIONS'),
        folios: override('HOSPITALITY_PROVIDER_FOLIOS'),
        rooms: override('HOSPITALITY_PROVIDER_ROOMS'),
        roomService: override('HOSPITALITY_PROVIDER_ROOM_SERVICE'),
        housekeeping: override('HOSPITALITY_PROVIDER_HOUSEKEEPING'),
      },
    },

    hms: {
      baseUrl: env.HMS_BASE_URL ?? '',
      apiKey: env.HMS_API_KEY ?? '',
      timeoutMs: parseInt(env.HMS_TIMEOUT_MS ?? '2000', 10),
      retryAttempts: parseInt(env.HMS_RETRY_ATTEMPTS ?? '3', 10),
      circuitThreshold: parseInt(env.HMS_CIRCUIT_THRESHOLD ?? '50', 10),
      circuitTimeoutMs: parseInt(env.HMS_CIRCUIT_TIMEOUT_MS ?? '10000', 10),
    },

    mock: {
      latencyMs: parseInt(env.MOCK_LATENCY_MS ?? '0', 10),
      failureRate: parseFloat(env.MOCK_FAILURE_RATE ?? '0'),
      outages: (env.MOCK_OUTAGES ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    },

    throttle: {
      ttl: parseInt(env.THROTTLE_TTL ?? '60', 10),
      limit: parseInt(env.THROTTLE_LIMIT ?? '120', 10),
    },

    features: {
      realtimeWebsockets: env.FEATURE_REALTIME_WEBSOCKETS !== 'false',
      expressCheckout: env.FEATURE_EXPRESS_CHECKOUT !== 'false',
    },

    observability: {
      otlpEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT || undefined,
      prometheusEnabled: env.PROMETHEUS_ENABLED !== 'false',
    },

    email: {
      host: env.SMTP_HOST ?? 'smtp.gmail.com',
      port: parseInt(env.SMTP_PORT ?? '587', 10),
      user: env.SMTP_USER ?? '',
      pass: env.SMTP_PASS ?? '',
      from: env.SMTP_FROM ?? 'noreply@innsync.app',
    },

    googleClientId: env.GOOGLE_CLIENT_ID ?? '',
  };
}

/**
 * Boot-time validation. Loud failure beats silent misconfig.
 */
export function validateEnv(raw: Record<string, unknown>): Record<string, unknown> {
  const env = raw as NodeJS.ProcessEnv;
  const isProd = env.NODE_ENV === 'production';
  const required = ['DATABASE_URL', 'REDIS_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter((k) => !env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
  if (isProd && (env.JWT_ACCESS_SECRET ?? '').length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be ≥32 chars in production');
  }
  return env as Record<string, unknown>;
}

@Injectable()
export class AppConfig implements AppConfigShape {
  readonly nodeEnv!: AppConfigShape['nodeEnv'];
  readonly port!: number;
  readonly logLevel!: string;
  readonly corsOrigins!: string[];
  readonly databaseUrl!: string;
  readonly redisUrl!: string;
  readonly jwt!: AppConfigShape['jwt'];
  readonly argon2!: AppConfigShape['argon2'];
  readonly hospitality!: AppConfigShape['hospitality'];
  readonly hms!: AppConfigShape['hms'];
  readonly mock!: AppConfigShape['mock'];
  readonly throttle!: AppConfigShape['throttle'];
  readonly features!: AppConfigShape['features'];
  readonly observability!: AppConfigShape['observability'];
  readonly email!: AppConfigShape['email'];
  readonly googleClientId!: string;

  // ConfigService doesn't expose the whole config tree, so we read fields
  // individually using known top-level keys.
  constructor(config: ConfigService) {
    const shape: AppConfigShape = {
      nodeEnv: config.get('nodeEnv') as AppConfigShape['nodeEnv'],
      port: config.get<number>('port')!,
      logLevel: config.get<string>('logLevel')!,
      corsOrigins: config.get<string[]>('corsOrigins')!,
      databaseUrl: config.get<string>('databaseUrl')!,
      redisUrl: config.get<string>('redisUrl')!,
      jwt: config.get<AppConfigShape['jwt']>('jwt')!,
      argon2: config.get<AppConfigShape['argon2']>('argon2')!,
      hospitality: config.get<AppConfigShape['hospitality']>('hospitality')!,
      hms: config.get<AppConfigShape['hms']>('hms')!,
      mock: config.get<AppConfigShape['mock']>('mock')!,
      throttle: config.get<AppConfigShape['throttle']>('throttle')!,
      features: config.get<AppConfigShape['features']>('features')!,
      observability: config.get<AppConfigShape['observability']>('observability')!,
      email: config.get<AppConfigShape['email']>('email')!,
      googleClientId: config.get<string>('googleClientId')!,
    };
    Object.assign(this, shape);
  }

  /** Resolve which provider to use for a given aggregate, honoring overrides. */
  providerFor(key: HospitalityAggregateKey): HospitalityProviderKind {
    return this.hospitality.overrides[key] ?? this.hospitality.global;
  }
}
