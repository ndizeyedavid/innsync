import React from "react";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";

export default function PrivacyScreen() {
  const router = useRouter();

  const privacyOptions = [
    {
      id: "1",
      icon: "eye-outline",
      title: "Data Collection",
      description: "See what data we collect",
      route: "/privacy/data-collection",
    },
    {
      id: "2",
      icon: "share-outline",
      title: "Data Sharing",
      description: "Control how your data is shared",
      route: "/privacy/data-sharing",
    },
    {
      id: "3",
      icon: "trash-outline",
      title: "Delete Your Data",
      description: "Request data deletion",
      route: "/privacy/delete-data",
    },
    {
      id: "4",
      icon: "download-outline",
      title: "Download Your Data",
      description: "Get a copy of your data",
      route: "/privacy/download-data",
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

      <TabHeader alt="SETTINGS" title="Privacy" />

      <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          {privacyOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              className={`p-4 border-b border-[#EFEDE7] ${
                index === privacyOptions.length - 1 ? "border-b-0" : ""
              }`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (option.route) {
                  router.push(option.route);
                }
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="size-10 bg-[#F5F4EF] rounded-full items-center justify-center">
                    <Ionicons name={option.icon} size={20} color="black" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold">
                      {option.title}
                    </Text>
                    <Text className="text-sm text-[#6E6B63]">
                      {option.description}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9C988E" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
