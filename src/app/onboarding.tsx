import OnboardingScreen from "../screens/OnboardingScreen";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import reservationsService from "../services/reservations.service";
import ContextualLoadingComponent from "../components/ContextualLoadingComponent";

export default function Onboarding() {
  const router = useRouter();
  const params = useLocalSearchParams();
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
        // If we have hotelId, skip checking stays and go straight to onboarding
        if (params.hotelId) {
          setCheckingStays(false);
          return;
        }

        // Otherwise check if user already has stays
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
  }, [isAuthenticated, authLoading, router, params.hotelId]);

  if (authLoading || checkingStays) {
    return <ContextualLoadingComponent text="Checking for your stays..." />;
  }

  return (
    <OnboardingScreen
      hotelId={params.hotelId as string}
      hotelName={params.hotelName as string}
    />
  );
}
