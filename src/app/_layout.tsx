import "../global.css";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { ToastProvider } from "../contexts/ToastContext";

export default function Layout() {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasInitialized, initializeAuth } =
    useAuthStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      await initializeAuth();
      setIsInitialLoad(false);
    };
    initAuth();
  }, []);

  // Redirect to guest when session expires mid-session
  useEffect(() => {
    if (!isInitialLoad && hasInitialized) {
      if (wasAuthenticated.current && !isAuthenticated && !isLoading) {
        router.replace("/guest");
      }
      wasAuthenticated.current = isAuthenticated;
    }
  }, [isAuthenticated, isLoading, hasInitialized, isInitialLoad]);

  return (
    <ToastProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
        }}
      />
    </ToastProvider>
  );
}
