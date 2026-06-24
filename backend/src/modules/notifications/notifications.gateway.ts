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
import { NotificationCreatedPayload } from 'src/infrastructure/events/domain-events';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@WebSocketGateway({ namespace: '/realtime/notifications', cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfig,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(): void {
    this.logger.log('NotificationsGateway initialized');
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
      wsConnections.inc({ namespace: 'notifications' });
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(): void {
    wsConnections.dec({ namespace: 'notifications' });
  }

  @OnEvent('notification.created')
  async onNotification(payload: NotificationCreatedPayload): Promise<void> {
    const n = await this.prisma.notification.findUnique({ where: { id: payload.notificationId } });
    if (!n) return;
    this.server.to(`user:${payload.userId}`).emit('notification.new', n);
  }
}
