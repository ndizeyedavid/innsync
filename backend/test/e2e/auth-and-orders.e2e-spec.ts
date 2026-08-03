/**
 * End-to-end skeleton: sign up → place order → list orders.
 *
 * Runs the full app against a real Postgres + Redis (via testcontainers in
 * CI). Demonstrates the request-response shape the frontend will integrate
 * with. Use this as the template when adding more e2e flows.
 */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

describe('Auth + Orders e2e (sketch)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: 1 /* URI */, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('signs up, signs in, places an order', async () => {
    const email = `e2e-${Date.now()}@innsync.dev`;
    const signUp = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-up')
      .send({ email, password: 'longpass123', name: 'E2E User' })
      .expect(201);
    expect(signUp.body.data.tokens.accessToken).toBeDefined();

    // Further steps would create a stay, then POST /v1/orders with an Idempotency-Key.
    // Kept slim for the starter; expand as feature coverage matures.
  });
});
