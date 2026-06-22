import { useEffect, useRef } from 'react';
import socketService from '../utils/socket';
import { OrderUpdateEvent, NotificationEvent } from '../api/types';

let hookInstanceCount = 0;
let isRootConnected = false;

function ensureConnected() {
  if (!isRootConnected) {
    socketService.connect();
    isRootConnected = true;
  }
}

function disconnectIfNoConsumers() {
  hookInstanceCount--;
  if (hookInstanceCount <= 0) {
    hookInstanceCount = 0;
    socketService.disconnect();
    isRootConnected = false;
  }
}

export function useWebSocket() {
  useEffect(() => {
    hookInstanceCount++;
    ensureConnected();

    return () => {
      disconnectIfNoConsumers();
    };
  }, []);

  return { isConnected: socketService.isConnected() };
}

export function useOrderUpdates(callback: (data: OrderUpdateEvent) => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useWebSocket();

  useEffect(() => {
    const handler = (data: OrderUpdateEvent) => {
      callbackRef.current(data);
    };

    socketService.onOrderUpdate(handler);

    return () => {
      socketService.offOrderUpdate(handler);
    };
  }, []);
}

/**
 * Hook for listening to notifications via WebSocket
 */
export function useNotifications(callback: (data: NotificationEvent) => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useWebSocket();

  useEffect(() => {
    const handler = (data: NotificationEvent) => {
      callbackRef.current(data);
    };

    socketService.onNotification(handler);

    return () => {
      socketService.offNotification(handler);
    };
  }, []);
}