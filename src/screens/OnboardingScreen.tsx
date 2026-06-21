import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useCallback } from "react";
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
import { router, useRouter } from "expo-router";
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
import {
  setOnboardingProgress,
  getOnboardingProgress,
  clearOnboardingProgress,
} from "../utils/storage";

interface OnboardingScreenProps {
  hotelId?: string;
  hotelName?: string;
}

export default function OnboardingScreen({
  hotelId: propHotelId,
  hotelName: propHotelName,
}: OnboardingScreenProps) {
  const { showToast } = useToast();
  const router = useRouter();
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
  const [checkingStays, setCheckingStays] = useState(!propHotelId);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [hotelId, setHotelId] = useState<string | undefined>(propHotelId);
  const [hotelName, setHotelName] = useState<string | undefined>(propHotelName);

  // Save progress to storage whenever relevant state changes
  const saveProgress = useCallback(() => {
    const progress = {
      hotelId,
      hotelName,
      step,
      checkIn: checkIn?.toISOString(),
      checkOut: checkOut?.toISOString(),
      adults,
      children,
      roomPreference,
      bedPreference,
      floorPreference,
      selectedMealPlanId,
      specialRequests,
      selectedVibeIndices,
      dietaryRestrictions,
    };
    setOnboardingProgress(progress);
  }, [
    hotelId,
    hotelName,
    step,
    checkIn,
    checkOut,
    adults,
    children,
    roomPreference,
    bedPreference,
    floorPreference,
    selectedMealPlanId,
    specialRequests,
    selectedVibeIndices,
    dietaryRestrictions,
  ]);

  // Load progress from storage on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await getOnboardingProgress();
        if (progress) {
          if (!propHotelId && progress.hotelId) {
            setHotelId(progress.hotelId);
            setHotelName(progress.hotelName);
            setCheckingStays(false);
          }
          if (progress.step) setStep(progress.step);
          if (progress.checkIn) setCheckIn(new Date(progress.checkIn));
          if (progress.checkOut) setCheckOut(new Date(progress.checkOut));
          if (progress.adults !== undefined) setAdults(progress.adults);
          if (progress.children !== undefined) setChildren(progress.children);
          if (progress.roomPreference)
            setRoomPreference(progress.roomPreference);
          if (progress.bedPreference) setBedPreference(progress.bedPreference);
          if (progress.floorPreference)
            setFloorPreference(progress.floorPreference);
          if (progress.selectedMealPlanId)
            setSelectedMealPlanId(progress.selectedMealPlanId);
          if (progress.specialRequests)
            setSpecialRequests(progress.specialRequests);
          if (progress.selectedVibeIndices)
            setSelectedVibeIndices(progress.selectedVibeIndices);
          if (progress.dietaryRestrictions)
            setDietaryRestrictions(progress.dietaryRestrictions);
        }
      } catch (error) {
        console.error("Error loading onboarding progress:", error);
      } finally {
        setLoadingProgress(false);
      }
    };

    loadProgress();
  }, [propHotelId]);

  // Save progress whenever it changes
  useEffect(() => {
    if (!loadingProgress) {
      saveProgress();
    }
  }, [loadingProgress, saveProgress]);

  // Check if user already has stays on load (only if no hotelId provided)
  useEffect(() => {
    const checkExistingStays = async () => {
      if (hotelId) {
        // If we have a hotelId, no need to check stays
        setCheckingStays(false);
        return;
      }

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
  }, [hotelId, router]);

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
    if (step === 4) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await handleSubmit();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

      if (!hotelId) {
        showToast("error", "Please select a hotel first");
        router.replace("/hotel-search");
        return;
      }

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
        hotelId,
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
      await clearOnboardingProgress();
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

  if (checkingStays || loadingProgress) {
    return <ContextualLoadingComponent text="Loading onboarding..." />;
  }

  // If no hotelId, show a prompt to select hotel
  if (!hotelId) {
    return (
      <ScreenLayout>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="bed-outline" size={64} color="#E8E5DD" />
          <Text className="text-2xl font-semibold text-navy text-center mt-6">
            Select a Hotel First
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            You need to select a hotel before continuing with booking
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            className="mt-8 px-6 py-4 bg-[#283D5A] rounded-2xl flex-row items-center gap-2"
            onPress={() => router.replace("/hotel-search")}
          >
            <Text className="text-white font-semibold">Select Hotel</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#fafaf7] pt-[50px]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Selected Hotel Header */}
      <View className="px-5 pb-4">
        <View className="flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100">
          <View className="w-10 h-10 rounded-xl bg-[#F5F4EF] items-center justify-center">
            <Ionicons name="bed-outline" size={20} color="#283D5A" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-500">
              Selected Hotel
            </Text>
            <Text className="text-lg font-semibold text-navy">
              {hotelName || "Hotel"}
            </Text>
          </View>
          <TouchableOpacity
            className="px-3 py-1 bg-[#F5F4EF] rounded-full"
            onPress={() => router.replace("/hotel-search")}
          >
            <Text className="text-xs font-medium text-[#283D5A]">Change</Text>
          </TouchableOpacity>
        </View>
      </View>

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
