import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../../components/TabHeader";
import ScreenLayout from "../../layout/ScreenLayout";
import * as Haptics from "expo-haptics";

export default function DataCollectionScreen() {
  const router = useRouter();

  const dataItems = [
    {
      title: "Personal Information",
      description: "Name, email address, phone number",
      icon: "person-outline",
    },
    {
      title: "Stay Information",
      description: "Check-in/out dates, room preferences, special requests",
      icon: "bed-outline",
    },
    {
      title: "Payment Information",
      description: "Payment method tokens (we don't store full card details)",
      icon: "card-outline",
    },
    {
      title: "Device Information",
      description: "Device type, IP address, browser information",
      icon: "phone-portrait-outline",
    },
    {
      title: "Usage Data",
      description: "How you interact with our app, features you use",
      icon: "analytics-outline",
    },
  ];

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

      <TabHeader alt="PRIVACY" title="Data Collection" />

      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-4">
          <Text className="text-base leading-relaxed text-[#6E6B63]">
            We collect information to provide you with a seamless hotel experience. Below is a detailed list of the data we collect and how we use it.
          </Text>
        </View>

        {dataItems.map((item, index) => (
          <View
            key={index}
            className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-3"
          >
            <View className="flex-row items-start gap-3">
              <View className="size-10 bg-[#F5F4EF] rounded-full items-center justify-center flex-shrink-0">
                <Ionicons name={item.icon} size={20} color="black" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold mb-1">
                  {item.title}
                </Text>
                <Text className="text-sm text-[#6E6B63]">
                  {item.description}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View className="bg-[#F5F4EF] rounded-2xl p-4 mt-4">
          <Text className="text-base font-semibold mb-2">
            Why we collect this data
          </Text>
          <Text className="text-sm text-[#6E6B63] leading-relaxed">
            We use this data to:
          </Text>
          <View className="mt-3 gap-2">
            <Text className="text-sm text-[#6E6B63]">• Process your stay bookings</Text>
            <Text className="text-sm text-[#6E6B63]">• Provide room service and amenities</Text>
            <Text className="text-sm text-[#6E6B63]">• Improve our app and services</Text>
            <Text className="text-sm text-[#6E6B63]">• Communicate important updates about your stay</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
