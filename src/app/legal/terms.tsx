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

export default function TermsOfServiceScreen() {
  const router = useRouter();

  const sections = [
    {
      title: "Acceptance of Terms",
      text: "By accessing and using the Innsync app, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree to these terms, please do not use our app.",
    },
    {
      title: "Use of Services",
      text: "Innsync provides a platform for hotel guest services including room service, digital key access, itinerary management, and more. You agree to use these services only for lawful purposes and in accordance with these terms.",
    },
    {
      title: "Account Responsibilities",
      text: "You are responsible for maintaining the confidentiality of your account and password, and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.",
    },
    {
      title: "Intellectual Property",
      text: "All content in the Innsync app, including but not limited to text, graphics, logos, and software, is the property of Innsync or our content suppliers and is protected by copyright laws.",
    },
    {
      title: "Limitation of Liability",
      text: "Innsync shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.",
    },
    {
      title: "Changes to Terms",
      text: "We reserve the right to modify these terms at any time. We will notify you of any changes by updating the 'Last Updated' date at the top of these terms.",
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

      <TabHeader alt="LEGAL" title="Terms of Service" />

      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-4">
          <Text className="text-sm text-[#9C988E] mb-1">Last Updated</Text>
          <Text className="text-base font-semibold">June 9, 2026</Text>
        </View>

        {sections.map((section, index) => (
          <View
            key={index}
            className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-3"
          >
            <Text className="text-lg font-semibold mb-2">
              {section.title}
            </Text>
            <Text className="text-sm text-[#6E6B63] leading-relaxed">
              {section.text}
            </Text>
          </View>
        ))}
      </ScrollView>
    </ScreenLayout>
  );
}
