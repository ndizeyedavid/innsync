import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './storage';
import CONFIG from '../constants/config';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = CONFIG.WEBSOCKET.RECONNECT_ATTEMPTS;

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    try {
      const token = await getAccessToken();
      
      if (!token) {
        console.warn('No auth token available for WebSocket connection');
        return;
      }

      this.socket = io(CONFIG.WEBSOCKET.URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: CONFIG.WEBSOCKET.RECONNECT_DELAY,
      });

      this.setupEventListeners();
      
      console.log('WebSocket connected');
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, CONFIG.WEBSOCKET.RECONNECT_DELAY);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Subscribe to order updates
   */
  onOrderUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('order:update', callback);
    }
  }

  /**
   * Subscribe to digital key events
   */
  onDigitalKeyEvent(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('digital-key:event', callback);
    }
  }

  /**
   * Subscribe to notifications
   */
  onNotification(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  /**
   * Unsubscribe from order updates
   */
  offOrderUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('order:update', callback);
    }
  }

  /**
   * Unsubscribe from digital key events
   */
  offDigitalKeyEvent(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('digital-key:event', callback);
    }
  }

  /**
   * Unsubscribe from notifications
   */
  offNotification(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('notification', callback);
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();