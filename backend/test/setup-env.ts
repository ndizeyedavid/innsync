/**
 * Test bootstrap — ensures predictable env vars.
 * Add testcontainer setup here when wiring up integration runs.
 */
process.env.NODE_ENV ??= 'test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-needs-thirty-two-chars';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-needs-thirty-two-chars';
process.env.HOSPITALITY_PROVIDER ??= 'mock';
process.env.USE_MEMORY_ONLY_MOCK = 'true';
process.env.DATABASE_URL ??= 'postgresql://innsync:innsync@localhost:5432/innsync_test?schema=public';
process.env.REDIS_URL ??= 'redis://localhost:6379';
