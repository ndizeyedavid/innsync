import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";

export default function RestartCheckinScreen() {
  const router = useRouter();

  const handleRestartCheckin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Handle restart check-in logic
    console.log("Restarting check-in process");
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
            <Ionicons name="checkmark-circle" size={24} color="#3F6B4F" />
          </View>
          <View>
            <Text className="text-sm text-[#A4A097]">CURRENT STATUS</Text>
            <Text className="text-lg font-semibold">Checked In</Text>
          </View>
        </View>

        <View className="bg-[#F5F4EF] rounded-xl p-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-[#6E6B63]">Room</Text>
            <Text className="text-sm font-semibold">Suite 1207</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-[#6E6B63]">Check-in Time</Text>
            <Text className="text-sm font-semibold">2:45 PM</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-[#6E6B63]">Check-in Date</Text>
            <Text className="text-sm font-semibold">April 26, 2024</Text>
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
              Restarting check-in will reset your current session and digital key access. You'll need to complete the check-in process again to regain access to your room.
            </Text>
          </View>
        </View>
      </View>

      {/* What Happens Card */}
      <View className="bg-white border border-[#EFEDE7] rounded-2xl p-5 mt-4">
        <Text className="text-sm font-semibold mb-4">What will happen:</Text>

        <View className="gap-4">
          <View className="flex-row items-start gap-3">
            <View className="size-6 bg-black rounded-full items-center justify-center mt-1">
              <Text className="text-white text-xs font-bold">1</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-1">Current Session Ends</Text>
              <Text className="text-xs text-[#6E6B63]">
                Your current check-in session will be terminated immediately
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-3">
            <View className="size-6 bg-black rounded-full items-center justify-center mt-1">
              <Text className="text-white text-xs font-bold">2</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-1">Digital Key Deactivated</Text>
              <Text className="text-xs text-[#6E6B63]">
                Your room access via digital key will be temporarily suspended
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-3">
            <View className="size-6 bg-black rounded-full items-center justify-center mt-1">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-1">New Check-in Required</Text>
              <Text className="text-xs text-[#6E6B63]">
                You'll need to go through the check-in process again to regain access
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-1 justify-end mt-6">
        <TouchableOpacity
          className="bg-black py-4 rounded-2xl items-center mb-3"
          onPress={handleRestartCheckin}
        >
          <Text className="text-white font-semibold text-lg">
            Restart Check-in Process
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white border-2 border-black py-4 rounded-2xl items-center"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Text className="text-black font-semibold text-lg">Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}