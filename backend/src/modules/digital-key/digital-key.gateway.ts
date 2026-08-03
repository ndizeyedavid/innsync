import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from 'src/config/configuration';
import { wsConnections } from 'src/infrastructure/observability/metrics.controller';
import { DigitalKeyUnlockPayload } from 'src/infrastructure/events/domain-events';

@WebSocketGateway({
  namespace: '/realtime/digital-keys',
  cors: { origin: '*' },
})
export class DigitalKeyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(DigitalKeyGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfig,
  ) {}

  afterInit(): void {
    this.logger.log('DigitalKeyGateway initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = (client.handshake.auth?.token as string | undefined) ??
        (client.handshake.headers['authorization'] as string | undefined)?.replace(/^Bearer /, '');
      if (!token) throw new Error('missing token');
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.config.jwt.accessSecret,
      });
      await client.join(`user:${payload.sub}`);
      wsConnections.inc({ namespace: 'digital-keys' });
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(): void {
    wsConnections.dec({ namespace: 'digital-keys' });
  }

  @OnEvent('digital_key.unlock_attempt')
  onUnlockAttempt(payload: DigitalKeyUnlockPayload): void {
    this.server.to(`user:${payload.userId}`).emit('digitalKey.unlock_attempt', {
      digitalKeyId: payload.digitalKeyId,
      method: payload.method,
      result: payload.result,
    });
  }
}
