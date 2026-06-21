import OnboardingScreen from "../screens/OnboardingScreen";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import reservationsService from "../services/reservations.service";
import ContextualLoadingComponent from "../components/ContextualLoadingComponent";

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
    return <ContextualLoadingComponent text="Checking for your stays..." />;
  }

  return <OnboardingScreen />;
}
