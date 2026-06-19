import OnboardingScreen from "../screens/OnboardingScreen";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { View, ActivityIndicator } from "react-native";
import reservationsService from "../services/reservations.service";

export default function Onboarding() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [checkingStays, setCheckingStays] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        router.replace("/guest");
        return;
      }

      try {
        const stays = await reservationsService.listMine();
        if (stays.length > 0) {
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking stays:", error);
      } finally {
        setCheckingStays(false);
      }
    };

    checkStatus();
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || checkingStays) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return <OnboardingScreen />;
}
