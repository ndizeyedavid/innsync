import { useEffect, useCallback, useRef } from 'react';
import socketService from '../utils/socket';
import { OrderUpdateEvent, DigitalKeyEvent, NotificationEvent } from '../api/types';

/**
 * Custom hook for WebSocket connections
 * Manages real-time subscriptions for orders, digital key events, and notifications
 */
export function useWebSocket() {
  const connectedRef = useRef(false);

  useEffect(() => {
    // Connect to WebSocket on mount
    socketService.connect();
    connectedRef.current = socketService.isConnected();

    // Disconnect on unmount
    return () => {
      socketService.disconnect();
      connectedRef.current = false;
    };
  }, []);

  const isConnected = socketService.isConnected();

  return {
    isConnected,
    connect: () => socketService.connect(),
    disconnect: () => socketService.disconnect(),
  };
}

/**
 * Hook for listening to order updates via WebSocket
 */
export function useOrderUpdates(callback: (data: OrderUpdateEvent) => void) {
  const { isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      socketService.onOrderUpdate(callback);
      
      return () => {
        socketService.offOrderUpdate(callback);
      };
    }
  }, [isConnected, callback]);
}

/**
 * Hook for listening to digital key events via WebSocket
 */
export function useDigitalKeyEvents(callback: (data: DigitalKeyEvent) => void) {
  const { isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      socketService.onDigitalKeyEvent(callback);
      
      return () => {
        socketService.offDigitalKeyEvent(callback);
      };
    }
  }, [isConnected, callback]);
}

/**
 * Hook for listening to notifications via WebSocket
 */
export function useNotifications(callback: (data: NotificationEvent) => void) {
  const { isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      socketService.onNotification(callback);
      
      return () => {
        socketService.offNotification(callback);
      };
    }
  }, [isConnected, callback]);
}