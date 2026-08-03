import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import reservationsService from "../services/reservations.service";
import { GuestStay } from "../api/types";
import { useToast } from "../contexts/ToastContext";

export default function RestartCheckinScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentStay, setCurrentStay] = useState<GuestStay | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    const loadCurrentStay = async () => {
      try {
        const stays = await reservationsService.listMine();
        // Find checked-in stay first, else first stay
        const activeStay =
          stays.find((s) => s.status === "CHECKED_IN") || stays[0] || null;
        setCurrentStay(activeStay);
      } catch (error) {
        console.error("Error loading stay:", error);
        showToast("error", "Failed to load stay details");
      } finally {
        setLoading(false);
      }
    };

    loadCurrentStay();
  }, []);

  const handleRestartCheckin = () => {
    Alert.alert(
      "Restart Check-in?",
      "Are you sure you want to restart the check-in process? This will reset your current session.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restart",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            try {
              setIsRestarting(true);

              // For now, we'll just navigate back to onboarding with the current hotel
              if (currentStay) {
                router.replace({
                  pathname: "/onboarding",
                  params: {
                    hotelId: currentStay.hotelId,
                    hotelName: currentStay.hotelName,
                    restart: "true",
                  },
                });
              } else {
                router.replace("/hotel-search");
              }

              showToast("success", "Check-in process restarted!");
            } catch (error) {
              console.error("Error restarting check-in:", error);
              showToast("error", "Failed to restart check-in");
            } finally {
              setIsRestarting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ScreenLayout>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#283D5A" />
        </View>
      </ScreenLayout>
    );
  }

  // Helper to format date/time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <ScreenLayout>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        className="mb-4"
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <TabHeader alt="DIGITAL KEY" title="Restart Check-in" />

      {/* Current Status Card */}
      <View className="bg-white border border-[#EFEDE7] rounded-2xl p-5 mt-4">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="size-12 bg-green-100 rounded-full items-center justify-center">
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
          <View>
            <Text className="text-sm text-[#A4A097]">CURRENT STATUS</Text>
            <Text className="text-lg font-semibold">
              {currentStay?.status || "Unknown"}
            </Text>
          </View>
        </View>

        <View className="bg-[#F5F4EF] rounded-xl p-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Room</Text>
            <Text className="text-sm font-semibold">
              {currentStay?.roomPreference || "Not assigned"}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Check-in Date</Text>
            <Text className="text-sm font-semibold">
              {currentStay?.checkIn ? formatDate(currentStay.checkIn) : "N/A"}
            </Text>
          </View>
        </View>
      </View>

      {/* Warning Card */}
      <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-4">
        <View className="flex-row items-start gap-3">
          <Ionicons name="warning" size={20} color="#DC2626" />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-red-800 mb-1">
              Important Notice
            </Text>
            <Text className="text-xs text-red-700 leading-relaxed">
              Restarting check-in will reset your current session and digital
              key access. You'll need to complete the check-in process again to
              regain access to your room.
            </Text>
          </View>
        </View>
      </View>

      {/* What Happens Card */}
      <View className="bg-white border border-[#EFEDE7] rounded-2xl p-5 mt-4">
        <Text className="text-sm font-semibold mb-4">What will happen:</Text>

        <View className="gap-4">
          <View className="flex-row items-start gap-3">
            <View className="size-6 bg-cobalt rounded-full items-center justify-center mt-1">
              <Text className="text-white text-xs font-bold">1</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-1">
                Current Session Ends
              </Text>
              <Text className="text-xs text-gray-500">
                Your current check-in session will be terminated immediately
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-3">
            <View className="size-6 bg-cobalt rounded-full items-center justify-center mt-1">
              <Text className="text-white text-xs font-bold">2</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-1">
                Digital Key Deactivated
              </Text>
              <Text className="text-xs text-gray-500">
                Your room access via digital key will be temporarily suspended
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-3">
            <View className="size-6 bg-cobalt rounded-full items-center justify-center mt-1">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-1">
                New Check-in Required
              </Text>
              <Text className="text-xs text-gray-500">
                You'll need to go through the check-in process again to regain
                access
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-1 justify-end mt-6">
        <TouchableOpacity
          className="bg-cobalt py-4 rounded-2xl items-center mb-3"
          onPress={handleRestartCheckin}
          disabled={isRestarting}
        >
          {isRestarting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-lg">
              Restart Check-in Process
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white border-2 border-black py-4 rounded-2xl items-center"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          disabled={isRestarting}
        >
          <Text className="text-black font-semibold text-lg">Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}
