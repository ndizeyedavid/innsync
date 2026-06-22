import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import { useState, useEffect } from "react";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import digitalKeyService from "../services/digital-key.service";
import reservationsService from "../services/reservations.service";
import { GuestStay as Reservation, DigitalKey } from "../api/types";

export default function DigitalKeyScreen() {
  const router = useRouter();
  const [currentReservation, setCurrentReservation] =
    useState<Reservation | null>(null);
  const [digitalKeyStatus, setDigitalKeyStatus] = useState<
    "ACTIVE" | "REVOKED" | "EXPIRED"
  >("ACTIVE");
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [autoConnect, setAutoConnect] = useState(true);
  const [lastUnlockTime, setLastUnlockTime] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentReservation();
  }, []);

  const loadCurrentReservation = async () => {
    try {
      const reservations = await reservationsService.listMine();
      const active =
        reservations.find((r) => r.status === "CHECKED_IN") || reservations[0];
      setCurrentReservation(active);
    } catch (error) {
      console.error("Error loading current reservation:", error);
    }
  };

  const handleUnlock = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      if (!currentReservation) {
        return;
      }

      // Record unlock attempt
      await digitalKeyService.recordTapUnlock(currentReservation.id);

      // Update last unlock time
      setLastUnlockTime(new Date().toLocaleTimeString());

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Unlock error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
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
        <Ionicons name="arrow-back" size={24} color="#283D5A" />
      </TouchableOpacity>

      <TabHeader alt="SETTINGS" title="Digital Key" />

      {/* Key Status */}
      <View
        className={`rounded-2xl p-5 mt-4 ${digitalKeyStatus === "ACTIVE" ? "bg-navy" : "bg-error"}`}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-gray-400 text-sm">KEY STATUS</Text>
            <Text className="text-white text-2xl font-bold capitalize">
              {digitalKeyStatus.toLowerCase()}
            </Text>
          </View>
          <View
            className={`size-12 ${digitalKeyStatus === "ACTIVE" ? "bg-success" : "bg-error-light"} rounded-full items-center justify-center`}
          >
            <Ionicons name="bluetooth" size={24} color="white" />
          </View>
        </View>
        <Text className="text-gray-400 text-xs">
          Connected to {currentReservation?.roomPreference || "Suite 1207"}
        </Text>
        {lastUnlockTime && (
          <Text className="text-gray-400 text-xs mt-1">
            Last unlock: {lastUnlockTime}
          </Text>
        )}
      </View>

      {/* Quick Unlock Button */}
      <TouchableOpacity
        onPress={handleUnlock}
        disabled={digitalKeyStatus !== "ACTIVE" || !bluetoothEnabled}
        className={`bg-navy rounded-2xl p-6 mt-4 flex-row items-center justify-between ${digitalKeyStatus !== "ACTIVE" || !bluetoothEnabled ? "opacity-50" : ""}`}
      >
        <View className="flex-row items-center gap-4">
          <View className="size-14 bg-white rounded-full items-center justify-center">
            <Ionicons name="lock-open" size={28} color="#283D5A" />
          </View>
          <View>
            <Text className="text-white text-xl font-semibold">
              Tap to Unlock
            </Text>
            <Text className="text-gray-400 text-sm">Hold phone near door</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="white" />
      </TouchableOpacity>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Bluetooth Settings */}
        <Text className="text-[18px] text-gray-500 mt-6 mb-3">BLUETOOTH</Text>

        <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <TouchableOpacity
            className="p-4 border-b border-gray-200 flex-row items-center justify-between"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setBluetoothEnabled(!bluetoothEnabled);
            }}
          >
            <View>
              <Text className="text-base font-semibold text-navy">
                Bluetooth
              </Text>
              <Text className="text-sm text-gray-500">
                Enable digital key access
              </Text>
            </View>
            <View
              className={`w-12 h-7 ${bluetoothEnabled ? "bg-cobalt" : "bg-gray-300"} rounded-full items-center justify-end px-1`}
            >
              <View
                className={`w-5 h-5 bg-white rounded-full ${bluetoothEnabled ? "" : "ml-auto"}`}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 flex-row items-center justify-between"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAutoConnect(!autoConnect);
            }}
          >
            <View>
              <Text className="text-base font-semibold text-navy">
                Auto-connect
              </Text>
              <Text className="text-sm text-gray-500">
                Connect when near door
              </Text>
            </View>
            <View
              className={`w-12 h-7 ${autoConnect ? "bg-cobalt" : "bg-gray-300"} rounded-full items-center justify-end px-1`}
            >
              <View
                className={`w-5 h-5 bg-white rounded-full ${autoConnect ? "" : "ml-auto"}`}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Backup PIN */}
        <Text className="text-[18px] text-gray-500 mt-6 mb-3">
          BACKUP ACCESS
        </Text>

        <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <TouchableOpacity
            className="p-4 border-b border-gray-200"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-3">
                <View className="size-10 bg-sand-100 rounded-full items-center justify-center">
                  <Ionicons name="key-outline" size={20} color="#283D5A" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-navy">
                    Backup PIN
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Use when Bluetooth unavailable
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
                <View className="size-10 bg-sand-100 rounded-full items-center justify-center">
                  <Ionicons name="qr-code-outline" size={20} color="#283D5A" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-navy">
                    QR Code Access
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Alternative entry method
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Key Info */}
        <View className="bg-sand-100 rounded-2xl p-4 mt-4">
          <Text className="text-sm font-semibold mb-2 text-navy">
            How Digital Key Works
          </Text>
          <Text className="text-xs text-gray-500 leading-relaxed mb-2">
            Your digital key uses Bluetooth Low Energy to communicate with the
            door lock. Hold your phone near the door for 1 second to unlock.
          </Text>
          <Text className="text-xs text-gray-500 leading-relaxed">
            Ensure Bluetooth is enabled and your phone has sufficient battery
            for optimal performance.
          </Text>
        </View>

        {/* Troubleshooting */}
        <TouchableOpacity
          className="bg-white border border-gray-200 rounded-2xl p-4 mt-4 flex-row items-center justify-between"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="help-circle-outline" size={20} color="#283D5A" />
            <Text className="text-base font-semibold text-navy">
              Troubleshooting
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}
