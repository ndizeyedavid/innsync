import "../global.css";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { useRouter } from "expo-router";
import LoadingScreen from "../screens/LoadingScreen";

export default function Layout() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Initialize authentication on app start
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Redirect based on auth state after initialization
    if (!isLoading) {
      if (isAuthenticated) {
        // If authenticated, ensure we're not on login/signup pages
        const currentRoute = router.canGoBack() ? "" : ""; // Get current route if needed
        // You can add specific route logic here
      } else {
        // If not authenticated, you might want to redirect to login
        // But we'll let users navigate to onboarding/login naturally
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    />
  );
}
