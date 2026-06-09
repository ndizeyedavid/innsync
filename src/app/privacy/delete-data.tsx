import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../../components/TabHeader";
import ScreenLayout from "../../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/ToastContext";

export default function DeleteDataScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleDeleteRequest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Delete Your Data?",
      "This will permanently delete your account and all associated data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            setConfirming(true);
            await handleConfirmDelete();
          },
        },
      ]
    );
  };

  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      // TODO: Call backend deletion endpoint
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      showToast("success", "Deletion request submitted");
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Delete data error:", error);
      showToast("error", "Failed to submit request");
    } finally {
      setIsLoading(false);
      setConfirming(false);
    }
  };

  const deletionItems = [
    {
      title: "What gets deleted",
      items: [
        "Your account and profile information",
        "All stay history and bookings",
        "Order history and invoices",
        "Personal preferences and settings",
      ],
    },
    {
      title: "What we keep",
      items: [
        "Anonymous data for analytics",
        "Records required by law",
        "Data necessary to resolve disputes",
      ],
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

      <TabHeader alt="PRIVACY" title="Delete Your Data" />

      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-[#FFF3CD] border border-[#FFC107] rounded-2xl p-4 mb-4">
          <View className="flex-row items-start gap-3">
            <Ionicons name="warning-outline" size={24} color="#FFC107" />
            <View className="flex-1">
              <Text className="text-base font-semibold text-[#856404] mb-1">
                Warning
              </Text>
              <Text className="text-sm text-[#856404] leading-relaxed">
                Once you submit a deletion request, your data will be removed permanently and cannot be recovered.
              </Text>
            </View>
          </View>
        </View>

        {deletionItems.map((section, idx) => (
          <View
            key={idx}
            className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-3"
          >
            <Text className="text-base font-semibold mb-3">
              {section.title}
            </Text>
            <View className="gap-2">
              {section.items.map((item, i) => (
                <View key={i} className="flex-row items-start gap-2">
                  <Ionicons
                    name={section.title.includes("kept") ? "checkmark-circle-outline" : "close-circle-outline"}
                    size={18}
                    color={section.title.includes("kept") ? "#3F6B4F" : "#DC2626"}
                  />
                  <Text className="text-sm text-[#6E6B63] flex-1">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View className="gap-3 mt-4">
          <TouchableOpacity
            onPress={handleDeleteRequest}
            disabled={isLoading}
            className="bg-[#DC2626] py-4 rounded-2xl items-center flex-row justify-center gap-2"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text className="text-white text-base font-semibold">
                  Submit Deletion Request
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
