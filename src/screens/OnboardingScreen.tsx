import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import OnboardingProgress from "../components/OnboardingProgress";
import TravelDetails from "../components/onboarding/TravelDetails";
import Preference from "../components/onboarding/Preference";
import OnboardingHeader from "../components/OnboardingHeader";
import VibeDetails from "../components/onboarding/VibeDetails";
import ReviewAndPay from "../components/onboarding/ReviewAndPay";
import PaymentSummary from "../components/PaymentSummary";
import { router } from "expo-router";

export default function OnboardingScreen() {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [step, setStep] = useState<number>(1);
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
      title: "Review & pay",
      description: "Confirm your booking details before check-in.",
    },
  ];
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
          />
        )}
        {step === 2 && <Preference />}

        {step === 3 && <VibeDetails />}

        {step === 4 && <ReviewAndPay />}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-white border-t border-gray-100">
        {step === 4 && <PaymentSummary />}

        <TouchableOpacity
          activeOpacity={0.8}
          className="w-full h-[56px] bg-black rounded-2xl mt-2 flex-row justify-center items-center gap-2"
          onPress={() =>
            step != 4 ? setStep((prev) => prev + 1) : router.replace("/(tabs)")
          }
        >
          <Text className="text-white text-base font-semibold">Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </KeyboardAvoidingView>
  );
}
