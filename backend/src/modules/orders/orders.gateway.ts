import { Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from 'src/config/configuration';
import { wsConnections } from 'src/infrastructure/observability/metrics.controller';
import { OrderStatusChangedPayload } from 'src/infrastructure/events/domain-events';

/**
 * Realtime channel for order status. Clients connect to `/realtime/orders`,
 * authenticate via JWT in the handshake, and receive `order.statusChanged`
 * events scoped to their userId room.
 *
 * Why a room per user, not per socket: a user might have multiple tabs/devices.
 * Joining `user:<id>` lets us emit once and reach all of them.
 */
@WebSocketGateway({
  namespace: '/realtime/orders',
  cors: { origin: '*', credentials: true },
})
export class OrdersGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(OrdersGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfig,
  ) {}

  afterInit(): void {
    this.logger.log('OrdersGateway initialized');
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
      wsConnections.inc({ namespace: 'orders' });
      this.logger.debug({ userId: payload.sub }, 'ws orders connected');
    } catch (e) {
      this.logger.warn({ err: (e as Error).message }, 'ws auth failed');
      client.disconnect(true);
    }
  }

  handleDisconnect(): void {
    wsConnections.dec({ namespace: 'orders' });
  }

  /**
   * The event bus fan-out. Whenever OrdersService updates a status, this
   * fires. Because we use the Redis-adapted Socket.IO server, the emit
   * reaches the client even if their socket is connected to a different pod.
   */
  @OnEvent('order.status_changed')
  onStatusChanged(payload: OrderStatusChangedPayload): void {
    this.server.to(`user:${payload.userId}`).emit('order.statusChanged', {
      orderId: payload.orderId,
      from: payload.from,
      to: payload.to,
      etaMinutes: payload.etaMinutes,
    });
  }

  /**
   * Optional client→server: a client can request the current state of an
   * order it just placed but hasn't seen a status for yet. Not required
   * for correctness — the REST GET works too — but cheap and useful.
   */
  @SubscribeMessage('order.ping')
  onPing(): { ok: true } {
    return { ok: true };
  }
}
