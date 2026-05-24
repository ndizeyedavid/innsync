import { Text, TouchableOpacity, View, ScrollView, Linking } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";

export default function HelpScreen() {
  const router = useRouter();

  const helpOptions = [
    {
      id: "1",
      icon: "chatbubbles-outline",
      title: "Live Chat",
      description: "Chat with our support team",
      action: "chat",
    },
    {
      id: "2",
      icon: "call-outline",
      title: "Call Support",
      description: "+1 (800) 123-4567",
      action: "call",
    },
    {
      id: "3",
      icon: "mail-outline",
      title: "Email Support",
      description: "support@innsync.com",
      action: "email",
    },
  ];

  const faqItems = [
    {
      id: "1",
      question: "How do I use my digital key?",
      answer: "Hold your phone near the door lock for 1 second. Ensure Bluetooth is enabled and your phone has sufficient battery.",
    },
    {
      id: "2",
      question: "Can I extend my stay?",
      answer: "Yes, you can request an extension through the app or by contacting the front desk. Subject to availability.",
    },
    {
      id: "3",
      question: "How do I view my folio?",
      answer: "Go to Profile > View folio to see all charges and transactions for your current stay.",
    },
  ];

  const handleHelpAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switch (action) {
      case "call":
        Linking.openURL("tel:+18001234567");
        break;
      case "email":
        Linking.openURL("mailto:support@innsync.com");
        break;
      case "chat":
        console.log("Open live chat");
        break;
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
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <TabHeader alt="SETTINGS" title="Help & Support" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Help */}
        <Text className="text-[18px] text-[#ACA9A0] mt-4 mb-3">GET HELP</Text>

        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          {helpOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              className={`p-4 border-b border-[#EFEDE7] ${index === helpOptions.length - 1 ? 'border-b-0' : ''}`}
              onPress={() => handleHelpAction(option.action)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="size-10 bg-[#F5F4EF] rounded-full items-center justify-center">
                    <Ionicons name={option.icon} size={20} color="black" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold">{option.title}</Text>
                    <Text className="text-sm text-[#6E6B63]">{option.description}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9C988E" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <Text className="text-[18px] text-[#ACA9A0] mt-6 mb-3">FREQUENTLY ASKED QUESTIONS</Text>

        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          {faqItems.map((faq, index) => (
            <View
              key={faq.id}
              className={`p-4 border-b border-[#EFEDE7] ${index === faqItems.length - 1 ? 'border-b-0' : ''}`}
            >
              <Text className="text-base font-semibold mb-2">{faq.question}</Text>
              <Text className="text-sm text-[#6E6B63] leading-relaxed">{faq.answer}</Text>
            </View>
          ))}
        </View>

        {/* More Help */}
        <TouchableOpacity
          className="bg-[#F5F4EF] rounded-2xl p-4 mt-4 flex-row items-center justify-between"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="book-outline" size={20} color="#000" />
            <Text className="text-base font-semibold">View Full FAQ</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9C988E" />
        </TouchableOpacity>

        {/* App Info */}
        <View className="bg-[#F5F4EF] rounded-2xl p-4 mt-4">
          <Text className="text-sm font-semibold mb-2">About Innsync</Text>
          <Text className="text-xs text-[#6E6B63] leading-relaxed mb-3">
            Innsync is a modern hotel experience platform that brings seamless digital check-in, smart room access, and personalized services to your fingertips.
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text className="text-xs text-blue-600 underline">Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text className="text-xs text-blue-600 underline">Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact */}
        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-4">
          <Text className="text-sm font-semibold text-blue-800 mb-2">
            Need More Help?
          </Text>
          <Text className="text-xs text-blue-700 leading-relaxed">
            Our support team is available 24/7. Contact us through any of the options above or visit the front desk.
          </Text>
        </View>

        {/* Version */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-xs text-[#9C988E]">Innsync Alpha v1.0.0</Text>
          <Text className="text-xs text-[#9C988E] mt-1">Build 2024.04.26</Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}