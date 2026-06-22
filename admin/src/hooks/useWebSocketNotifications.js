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
    if (!user?.accessToken) return;

    const socket = io(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/v1/realtime/notifications`, {
      auth: { token: user.accessToken },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[WS] Notifications connected");
    });

    socket.on("notification.new", () => {
      onNewNotification();
    });

    socket.on("disconnect", (reason) => {
      console.log("[WS] Notifications disconnected:", reason);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.accessToken, onNewNotification]);
}
