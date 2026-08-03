import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './storage';
import CONFIG from '../constants/config';

class SocketService {
  private orderSocket: Socket | null = null;
  private notifSocket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = CONFIG.WEBSOCKET.RECONNECT_ATTEMPTS;

  /**
   * Connect to WebSocket servers (orders + notifications namespaces)
   */
  connect(): void {
    try {
      if (this.orderSocket || this.notifSocket) return;

      const baseUrl = CONFIG.WEBSOCKET.URL;
      const opts: any = {
        auth: (cb: any) => {
          getAccessToken().then((token) => {
            cb({ token });
          });
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: CONFIG.WEBSOCKET.RECONNECT_DELAY,
      };

      this.orderSocket = io(`${baseUrl}${CONFIG.WEBSOCKET.NAMESPACES.ORDERS}`, opts);
      this.notifSocket = io(`${baseUrl}${CONFIG.WEBSOCKET.NAMESPACES.NOTIFICATIONS}`, opts);

      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  /**
   * Disconnect from WebSocket servers
   */
  disconnect(): void {
    this.orderSocket?.disconnect();
    this.notifSocket?.disconnect();
    this.orderSocket = null;
    this.notifSocket = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    const onConnect = () => { this.reconnectAttempts = 0; };

    [this.orderSocket, this.notifSocket].forEach((s) => {
      if (!s) return;
      s.on('connect', onConnect);
    });
  }

  /**
   * Subscribe to order status updates (backend gateway emits: order.statusChanged)
   */
  onOrderUpdate(callback: (data: any) => void): void {
    this.orderSocket?.on('order.statusChanged', callback);
  }

  /**
   * Subscribe to notifications (backend event: notification.new)
   */
  onNotification(callback: (data: any) => void): void {
    this.notifSocket?.on('notification.new', callback);
  }

  /**
   * Unsubscribe from order updates
   */
  offOrderUpdate(callback: (data: any) => void): void {
    this.orderSocket?.off('order.statusChanged', callback);
  }

  /**
   * Unsubscribe from notifications
   */
  offNotification(callback: (data: any) => void): void {
    this.notifSocket?.off('notification.new', callback);
  }

  /**
   * Check if sockets are connected
   */
  isConnected(): boolean {
    return (this.orderSocket?.connected || false) && (this.notifSocket?.connected || false);
  }
}

export default new SocketService();