import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenLayout from "../layout/ScreenLayout";
import OnboardingProgress from "../components/OnboardingProgress";
import TravelDetails from "../components/onboarding/TravelDetails";
import Preference from "../components/onboarding/Preference";
import OnboardingHeader from "../components/OnboardingHeader";
import VibeDetails from "../components/onboarding/VibeDetails";
import ReviewAndConfirm from "../components/onboarding/ReviewAndConfirm";
import PaymentSummary from "../components/PaymentSummary";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import apiClient from "../api/client";
import { useToast } from "../contexts/ToastContext";
import {
  CreateStayDto,
  GuestInfoDto,
  MealPlanDto,
  GuestStay,
  ApiResponse,
} from "../api/types";
import { mealPlans } from "../constants/mealPlans";
import { vibeCards } from "../constants/vibeCards";
import reservationsService from "../services/reservations.service";
import ContextualLoadingComponent from "../components/ContextualLoadingComponent";

export default function OnboardingScreen() {
  const { showToast } = useToast();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [roomPreference, setRoomPreference] = useState<string>();
  const [bedPreference, setBedPreference] = useState<string>();
  const [floorPreference, setFloorPreference] = useState<string>();
  const [selectedMealPlanId, setSelectedMealPlanId] =
    useState<string>("room-only");
  const [specialRequests, setSpecialRequests] = useState<string>();
  const [selectedVibeIndices, setSelectedVibeIndices] = useState<number[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStays, setCheckingStays] = useState(true);

  // Check if user already has stays on load
  useEffect(() => {
    const checkExistingStays = async () => {
      try {
        const stays = await reservationsService.listMine();
        if (stays.length > 0) {
          // If user already has stays, skip onboarding
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking stays:", error);
      } finally {
        setCheckingStays(false);
      }
    };

    checkExistingStays();
  }, []);

  const onBoardingHeaders = [
    {
      title: "Travel details",
      description: "Tell us when you're arriving and who's coming.",
    },
    {
      title: "Your preferences",
      description: "Help us personalize your stay.",
    },
    {
      title: "What's your vibe?",
      description: "Pick the experiences that excite you most.",
    },
    {
      title: "Review & confirm",
      description: "Confirm your booking details before check-in.",
    },
  ];

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (step === 4) {
      await handleSubmit();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!checkIn || !checkOut) {
        showToast("error", "Please select check-in and check-out dates");
        return;
      }

      const nights = calculateNights();
      if (nights < 1) {
        showToast("error", "Check-out date must be after check-in date");
        return;
      }

      if (adults < 1) {
        showToast("error", "At least 1 adult is required");
        return;
      }

      const itineraryVibes = selectedVibeIndices.map(
        (index) => vibeCards[index].title,
      );
      const mealPlan: MealPlanDto = selectedMealPlanId as MealPlanDto;

      const createStayDto: CreateStayDto = {
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        nights,
        adults,
        children,
        roomPreference,
        bedPreference,
        floorPreference,
        mealPlan,
        specialRequests,
        itineraryVibes,
        dietaryRestrictions,
      };

      const stayResponse = await apiClient.post<ApiResponse<GuestStay>>(
        "/reservations",
        createStayDto,
      );
      const stayId = stayResponse.data.data.id;

      const guestInfoDto: GuestInfoDto = {
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        nights,
        adults,
        children,
        roomPreference,
        bedPreference,
        floorPreference,
        mealPlan,
        specialRequests: specialRequests || "",
        itineraryVibes,
        dietaryRestrictions,
      };

      await apiClient.post<ApiResponse<GuestStay>>(
        `/reservations/${stayId}/guest-info`,
        guestInfoDto,
      );

      showToast("success", "Onboarding completed!");
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      showToast(
        "error",
        error?.message || "An error occurred during onboarding",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingStays) {
    return <ContextualLoadingComponent text="Checking for your stays..." />;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#fafaf7] pt-[50px]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <OnboardingProgress step={step} setProgress={setStep} />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeader
          step={step}
          title={onBoardingHeaders[step - 1].title}
          description={onBoardingHeaders[step - 1].description}
        />

        {step === 1 && (
          <TravelDetails
            checkIn={checkIn}
            checkOut={checkOut}
            setCheckIn={setCheckIn}
            setCheckOut={setCheckOut}
            adults={adults}
            setAdults={setAdults}
            children={children}
            setChildren={setChildren}
          />
        )}
        {step === 2 && (
          <Preference
            roomPreference={roomPreference}
            setRoomPreference={setRoomPreference}
            bedPreference={bedPreference}
            setBedPreference={setBedPreference}
            floorPreference={floorPreference}
            setFloorPreference={setFloorPreference}
            selectedMealPlanId={selectedMealPlanId}
            setSelectedMealPlanId={setSelectedMealPlanId}
            specialRequests={specialRequests}
            setSpecialRequests={setSpecialRequests}
            dietaryRestrictions={dietaryRestrictions}
            setDietaryRestrictions={setDietaryRestrictions}
          />
        )}

        {step === 3 && (
          <VibeDetails
            selectedVibeIndices={selectedVibeIndices}
            setSelectedVibeIndices={setSelectedVibeIndices}
          />
        )}

        {step === 4 && (
          <ReviewAndConfirm
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            children={children}
            roomPreference={roomPreference}
            bedPreference={bedPreference}
            floorPreference={floorPreference}
            selectedMealPlanId={selectedMealPlanId}
            specialRequests={specialRequests}
            selectedVibeIndices={selectedVibeIndices}
            dietaryRestrictions={dietaryRestrictions}
          />
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-white border-t border-gray-100">
        {step === 4 && <PaymentSummary />}

        <TouchableOpacity
          activeOpacity={0.8}
          className="w-full h-[56px] bg-cobalt rounded-2xl mt-2 flex-row justify-center items-center gap-2"
          onPress={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white text-base font-semibold">
                {step === 4 ? "Confirm Booking" : "Continue"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </KeyboardAvoidingView>
  );
}
