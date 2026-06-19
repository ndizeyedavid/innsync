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

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const sections = [
    {
      title: "Introduction",
      text: "This Privacy Policy explains how Innsync collects, uses, and shares your personal information when you use our app. By using Innsync, you agree to the collection and use of information in accordance with this policy.",
    },
    {
      title: "Information We Collect",
      text: "We collect information you provide directly, such as your name, email address, phone number, and payment information. We also collect information automatically, including device information, usage data, and location information (with your permission).",
    },
    {
      title: "How We Use Information",
      text: "We use the information we collect to provide and improve our services, process your transactions, communicate with you, and ensure the security of your account.",
    },
    {
      title: "Information Sharing",
      text: "We may share your information with service providers who assist us in operating our app, with hotel partners to facilitate your stay, and when required by law.",
    },
    {
      title: "Data Security",
      text: "We implement appropriate security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.",
    },
    {
      title: "Your Rights",
      text: "You have the right to access, correct, or delete your personal information. You can also opt out of certain data uses. To exercise these rights, please contact us or use the controls in the Privacy section of our app.",
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

      <TabHeader alt="LEGAL" title="Privacy Policy" />

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
