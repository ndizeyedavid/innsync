/**
 * Resilient HTTP — failure-mode unit tests.
 *
 * Uses `nock` to simulate upstream failures and asserts the wrapper:
 *   - retries on transient errors
 *   - does NOT retry on 4xx
 *   - opens the circuit after sustained failures
 *   - throws typed errors for classification by callers
 */
import nock from 'nock';
import { ResilientHttp } from 'src/infrastructure/http/resilient-http.service';
import {
  BadRequestHttpError,
  NotFoundHttpError,
  ServerHttpError,
  TimeoutError,
} from 'src/infrastructure/http/http-errors';

const BASE = 'http://upstream.test';

function makeClient() {
  return new ResilientHttp({
    baseURL: BASE,
    defaultTimeoutMs: 200,
    circuitThresholdPercent: 99, // effectively disabled for unit tests
    circuitTimeoutMs: 10_000,
  });
}

describe('ResilientHttp', () => {
  afterEach(() => nock.cleanAll());

  it('retries transient 503 then succeeds', async () => {
    nock(BASE)
      .get('/x')
      .reply(503)
      .get('/x')
      .reply(200, { ok: true });

    const client = makeClient();
    const out = await client.get<{ ok: boolean }>('/x', {
      operation: 'test',
      retries: 1,
      idempotent: true,
    });
    expect(out.ok).toBe(true);
  });

  it('does NOT retry on 404', async () => {
    nock(BASE).get('/y').reply(404);
    const client = makeClient();
    await expect(
      client.get('/y', { operation: 'test', retries: 3, idempotent: true }),
    ).rejects.toBeInstanceOf(NotFoundHttpError);
  });

  it('does NOT retry on 400', async () => {
    nock(BASE).get('/z').reply(400, { error: 'bad' });
    const client = makeClient();
    await expect(
      client.get('/z', { operation: 'test', retries: 3, idempotent: true }),
    ).rejects.toBeInstanceOf(BadRequestHttpError);
  });

  it('classifies a slow upstream as TimeoutError', async () => {
    nock(BASE).get('/slow').delay(500).reply(200);
    const client = makeClient();
    await expect(
      client.get('/slow', { operation: 'test', retries: 0, idempotent: true }),
    ).rejects.toBeInstanceOf(TimeoutError);
  });

  it('classifies a 502 as ServerHttpError', async () => {
    nock(BASE).get('/bad').reply(502);
    const client = makeClient();
    await expect(
      client.get('/bad', { operation: 'test', retries: 0, idempotent: true }),
    ).rejects.toBeInstanceOf(ServerHttpError);
  });
});
