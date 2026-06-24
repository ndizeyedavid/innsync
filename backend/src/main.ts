import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ServerOptions } from 'socket.io';
import { join } from 'path';
import express from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppConfig } from './config/configuration';
import { RedisService } from './infrastructure/redis/redis.service';

/**
 * Redis-backed Socket.IO adapter — required so realt ime events broadcast
 * across multiple API pods.
 */
class RedisIoAdapter extends IoAdapter {
  constructor(app: ConstructorParameters<typeof IoAdapter>[0], private readonly redis: RedisService) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);
    const pub = this.redis.duplicate();
    const sub = this.redis.duplicate();
    server.adapter(createAdapter(pub, sub));
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Replace Nest's default logger with pino (structured JSON, redaction-friendly).
  app.useLogger(app.get(Logger));

  const config = app.get(AppConfig);
  const redis = app.get(RedisService);

  // Hardening
  app.use(helmet());
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Serve uploaded files
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Versioned routing: /api/v1/...
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Global validation — strict whitelist prevents extra-field smuggling
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
    }),
  );

  // Consistent error envelope across all routes
  app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));

  // Camel-case envelope; metadata for cache-source, traceId, etc.
  app.useGlobalInterceptors(new TransformInterceptor());

  // Real-time uses the Redis-adapted Socket.IO server
  app.useWebSocketAdapter(new RedisIoAdapter(app, redis));

  // Swagger — only in non-production environments
  if (config.nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('InnSync API')
      .setDescription('Guest-facing API for the InnSync hospitality platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  app.enableShutdownHooks();

  await app.listen(config.port, '0.0.0.0');
  app.get(Logger).log(`InnSync API listening on :${config.port} (env=${config.nodeEnv})`);
}

void bootstrap();
