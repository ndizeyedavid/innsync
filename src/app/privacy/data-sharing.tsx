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

export default function DataSharingScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [sharingEnabled, setSharingEnabled] = useState({
    serviceProviders: true,
    analytics: true,
    marketing: false,
  });

  const handleToggle = (key: keyof typeof sharingEnabled) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSharingEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
    showToast("success", "Preference updated");
  };

  const sharingItems = [
    {
      key: "serviceProviders" as const,
      title: "Service Providers",
      description: "Share data with our trusted service providers (hotel partners, payment processors)",
      icon: "business-outline",
    },
    {
      key: "analytics" as const,
      title: "Analytics",
      description: "Share anonymous usage data to improve our app",
      icon: "analytics-outline",
    },
    {
      key: "marketing" as const,
      title: "Marketing Partners",
      description: "Share data with marketing partners (opt-in only)",
      icon: "megaphone-outline",
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

      <TabHeader alt="PRIVACY" title="Data Sharing" />

      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-4">
          <Text className="text-base leading-relaxed text-[#6E6B63]">
            We only share your data with trusted partners and only when necessary to provide our services. You can control your sharing preferences below.
          </Text>
        </View>

        {sharingItems.map((item, index) => (
          <View
            key={item.key}
            className={`bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-3 ${
              index === sharingItems.length - 1 ? "mb-0" : ""
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
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
              <Switch
                value={sharingEnabled[item.key]}
                onValueChange={() => handleToggle(item.key)}
                trackColor={{ false: "#EFEDE7", true: "#000" }}
                thumbColor="#fff"
              />
            </View>
          </View>
        ))}

        <View className="bg-[#F5F4EF] rounded-2xl p-4 mt-6">
          <Text className="text-base font-semibold mb-2">
            Important Note
          </Text>
          <Text className="text-sm text-[#6E6B63] leading-relaxed">
            Disabling some sharing options may affect your experience, and we may still be required to share data by law.
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
