import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from 'src/config/configuration';
import { wsConnections } from 'src/infrastructure/observability/metrics.controller';

@WebSocketGateway({
  namespace: '/realtime/housekeeping',
  cors: { origin: '*' },
})
export class HousekeepingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(HousekeepingGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfig,
  ) {}

  afterInit(): void {
    this.logger.log('HousekeepingGateway initialized');
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
      wsConnections.inc({ namespace: 'housekeeping' });
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(): void {
    wsConnections.dec({ namespace: 'housekeeping' });
  }
}
