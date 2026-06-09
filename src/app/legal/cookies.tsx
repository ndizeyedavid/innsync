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
import TabHeader from "../../components/TabHeader";
import ScreenLayout from "../../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import { useToast } from "../../contexts/ToastContext";

export default function CookiePolicyScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false,
  });

  const handleSavePreferences = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showToast("success", "Cookie preferences saved");
  };

  const cookieTypes = [
    {
      key: "necessary" as const,
      title: "Necessary Cookies",
      description: "Required for basic app functionality. Cannot be disabled.",
      disabled: true,
    },
    {
      key: "functional" as const,
      title: "Functional Cookies",
      description: "Enhance functionality like remembering your preferences.",
      disabled: false,
    },
    {
      key: "analytics" as const,
      title: "Analytics Cookies",
      description: "Help us understand how you use the app.",
      disabled: false,
    },
    {
      key: "marketing" as const,
      title: "Marketing Cookies",
      description: "Personalize ads and content you see.",
      disabled: false,
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

      <TabHeader alt="LEGAL" title="Cookie Policy" />

      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-4">
          <Text className="text-sm text-[#9C988E] mb-1">Last Updated</Text>
          <Text className="text-base font-semibold">June 9, 2026</Text>
        </View>

        <View className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-4">
          <Text className="text-lg font-semibold mb-3">About Cookies</Text>
          <Text className="text-sm text-[#6E6B63] leading-relaxed">
            Cookies are small text files stored on your device that help us provide you with a better experience. This policy explains the types of cookies we use and how you can control them.
          </Text>
        </View>

        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden mb-4">
          {cookieTypes.map((type, index) => (
            <View
              key={type.key}
              className={`p-4 border-b border-[#EFEDE7] ${
                index === cookieTypes.length - 1 ? "border-b-0" : ""
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold mb-1">
                    {type.title}
                  </Text>
                  <Text className="text-sm text-[#6E6B63]">
                    {type.description}
                  </Text>
                </View>
                <Switch
                  value={cookieSettings[type.key]}
                  onValueChange={(value) => {
                    if (!type.disabled) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCookieSettings((prev) => ({
                        ...prev,
                        [type.key]: value,
                      }));
                    }
                  }}
                  disabled={type.disabled}
                  trackColor={{ false: "#EFEDE7", true: "#000" }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleSavePreferences}
          className="bg-black py-4 rounded-2xl items-center flex-row justify-center gap-2 mb-6"
        >
          <Ionicons name="save-outline" size={20} color="white" />
          <Text className="text-white text-base font-semibold">
            Save Preferences
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}
