import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { useAuth } from "contexts/AuthContext";

export function useWebSocketNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  const onNewNotification = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
  }, [queryClient]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!user || !token) return;

    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:3000";
    const wsUrl = `${baseUrl.replace(/\/api\/v1\/?$/, "")}/realtime/notifications`;

    const socket = io(wsUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on("notification.new", () => {
      onNewNotification();
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, onNewNotification]);
}
