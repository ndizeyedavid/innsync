import React from "react";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";

export default function LegalScreen() {
  const router = useRouter();

  const legalOptions = [
    {
      id: "1",
      icon: "document-text-outline",
      title: "Terms of Service",
      description: "Read our terms and conditions",
      route: "/legal/terms",
    },
    {
      id: "2",
      icon: "shield-checkmark-outline",
      title: "Privacy Policy",
      description: "Learn how we handle your data",
      route: "/legal/privacy",
    },
    {
      id: "3",
      icon: "cog-outline",
      title: "Cookie Policy",
      description: "Manage cookie preferences",
      route: "/legal/cookies",
    },
    {
      id: "4",
      icon: "information-circle-outline",
      title: "Licenses",
      description: "Open source software licenses",
      route: "/legal/licenses",
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

      <TabHeader alt="SETTINGS" title="Legal" />

      <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          {legalOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              className={`p-4 border-b border-[#EFEDE7] ${
                index === legalOptions.length - 1 ? "border-b-0" : ""
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
