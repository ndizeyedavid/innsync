import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Switch,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";

export default function NotificationsScreen() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [stayReminders, setStayReminders] = useState(true);

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

      <TabHeader alt="SETTINGS" title="Notifications" />

      <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden mb-4">
          <View className="p-4 border-b border-[#EFEDE7]">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-base font-semibold">Push Notifications</Text>
                <Text className="text-sm text-[#6E6B63]">Receive alerts on your device</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: "#EFEDE7", true: "#000" }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View className="p-4 border-b border-[#EFEDE7]">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-base font-semibold">Email Notifications</Text>
                <Text className="text-sm text-[#6E6B63]">Receive updates via email</Text>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: "#EFEDE7", true: "#000" }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        <Text className="text-[18px] text-[#ACA9A0] mb-3">ALERTS</Text>

        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          <View className="p-4 border-b border-[#EFEDE7]">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-base font-semibold">Order Updates</Text>
                <Text className="text-sm text-[#6E6B63]">Get notified when your order status changes</Text>
              </View>
              <Switch
                value={orderUpdates}
                onValueChange={setOrderUpdates}
                trackColor={{ false: "#EFEDE7", true: "#000" }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View className="p-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-base font-semibold">Stay Reminders</Text>
                <Text className="text-sm text-[#6E6B63]">Check-in and check-out reminders</Text>
              </View>
              <Switch
                value={stayReminders}
                onValueChange={setStayReminders}
                trackColor={{ false: "#EFEDE7", true: "#000" }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
