import { Text, TouchableOpacity, View, ScrollView } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";

export default function DigitalKeyScreen() {
  const router = useRouter();

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

      <TabHeader alt="SETTINGS" title="Digital Key" />

      {/* Key Status */}
      <View className="bg-black rounded-2xl p-5 mt-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-[#989896] text-sm">KEY STATUS</Text>
            <Text className="text-white text-2xl font-bold">Active</Text>
          </View>
          <View className="size-12 bg-green-500 rounded-full items-center justify-center">
            <Ionicons name="bluetooth" size={24} color="white" />
          </View>
        </View>
        <Text className="text-[#959592] text-xs">Connected to Suite 1207</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Bluetooth Settings */}
        <Text className="text-[18px] text-[#ACA9A0] mt-6 mb-3">BLUETOOTH</Text>

        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          <TouchableOpacity
            className="p-4 border-b border-[#EFEDE7] flex-row items-center justify-between"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View>
              <Text className="text-base font-semibold">Bluetooth</Text>
              <Text className="text-sm text-[#6E6B63]">Enable digital key access</Text>
            </View>
            <View className="w-12 h-7 bg-black rounded-full items-center justify-end px-1">
              <View className="w-5 h-5 bg-white rounded-full" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 flex-row items-center justify-between"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View>
              <Text className="text-base font-semibold">Auto-connect</Text>
              <Text className="text-sm text-[#6E6B63]">Connect when near door</Text>
            </View>
            <View className="w-12 h-7 bg-black rounded-full items-center justify-end px-1">
              <View className="w-5 h-5 bg-white rounded-full" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Backup PIN */}
        <Text className="text-[18px] text-[#ACA9A0] mt-6 mb-3">BACKUP ACCESS</Text>

        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          <TouchableOpacity
            className="p-4 border-b border-[#EFEDE7]"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-3">
                <View className="size-10 bg-[#F5F4EF] rounded-full items-center justify-center">
                  <Ionicons name="key-outline" size={20} color="black" />
                </View>
                <View>
                  <Text className="text-base font-semibold">Backup PIN</Text>
                  <Text className="text-sm text-[#6E6B63]">Use when Bluetooth unavailable</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9C988E" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-3">
                <View className="size-10 bg-[#F5F4EF] rounded-full items-center justify-center">
                  <Ionicons name="qr-code-outline" size={20} color="black" />
                </View>
                <View>
                  <Text className="text-base font-semibold">QR Code Access</Text>
                  <Text className="text-sm text-[#6E6B63]">Alternative entry method</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9C988E" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Key Info */}
        <View className="bg-[#F5F4EF] rounded-2xl p-4 mt-4">
          <Text className="text-sm font-semibold mb-2">How Digital Key Works</Text>
          <Text className="text-xs text-[#6E6B63] leading-relaxed mb-2">
            Your digital key uses Bluetooth Low Energy to communicate with the door lock. Hold your phone near the door for 1 second to unlock.
          </Text>
          <Text className="text-xs text-[#6E6B63] leading-relaxed">
            Ensure Bluetooth is enabled and your phone has sufficient battery for optimal performance.
          </Text>
        </View>

        {/* Troubleshooting */}
        <TouchableOpacity
          className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mt-4 flex-row items-center justify-between"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="help-circle-outline" size={20} color="#000" />
            <Text className="text-base font-semibold">Troubleshooting</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9C988E" />
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}