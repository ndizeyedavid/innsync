import "../global.css";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth.store";
import LoadingScreen from "../components/LoadingScreen";
import { ToastProvider } from "../contexts/ToastContext";
import LoadingComponent from "../components/LoadingComponent";

export default function Layout() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Initialize authentication on app start
    const initAuth = async () => {
      await initializeAuth();
      setIsInitialLoad(false);
    };
    initAuth();
  }, []);

  // Only show loading screen on initial load, not on navigation
  if (isInitialLoad || isLoading) {
    // return <LoadingComponent />;
  }

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
