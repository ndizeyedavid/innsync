import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
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

export default function DownloadDataScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const dataCategories = [
    { name: "Account Information", size: "12 KB" },
    { name: "Stay History", size: "256 KB" },
    { name: "Order History", size: "192 KB" },
    { name: "Profile & Preferences", size: "8 KB" },
  ];

  const handleRequestDownload = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      setIsRequesting(true);
      // TODO: Call backend download endpoint
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setRequested(true);
      showToast("success", "Download request submitted! You'll receive an email when it's ready.");
    } catch (error) {
      console.error("Download data error:", error);
      showToast("error", "Failed to submit request");
    } finally {
      setIsRequesting(false);
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

      <TabHeader alt="PRIVACY" title="Download Your Data" />

      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        {requested ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="size-20 bg-[#F5F4EF] rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={48} color="#3F6B4F" />
            </View>
            <Text className="text-xl font-semibold mb-2">Request Submitted!</Text>
            <Text className="text-center text-[#6E6B63] px-6 mb-6">
              We're preparing your data. You'll receive an email at{" "}
              <Text className="font-semibold">{user?.email}</Text> with a download link within 24 hours.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setRequested(false);
              }}
              className="px-6 py-3 border border-[#EFEDE7] rounded-xl"
            >
              <Text className="text-base font-semibold">Submit Another Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-4">
              <Text className="text-base leading-relaxed text-[#6E6B63]">
                Request a copy of all your personal data. Your download will include the following categories:
              </Text>
            </View>

            <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden mb-4">
              {dataCategories.map((item, index) => (
                <View
                  key={index}
                  className={`p-4 border-b border-[#EFEDE7] flex-row justify-between items-center ${
                    index === dataCategories.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <Text className="text-base">{item.name}</Text>
                  <Text className="text-sm text-[#9C988E]">{item.size}</Text>
                </View>
              ))}
            </View>

            <View className="bg-[#F5F4EF] rounded-2xl p-4 mb-4">
              <View className="flex-row items-start gap-2">
                <Ionicons name="information-circle-outline" size={20} color="#9C988E" />
                <Text className="text-sm text-[#6E6B63] flex-1 leading-relaxed">
                  Download files are usually available within 24 hours and expire after 7 days. You can request one download per month.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleRequestDownload}
              disabled={isRequesting}
              className="bg-black py-4 rounded-2xl items-center flex-row justify-center gap-2"
            >
              {isRequesting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color="white" />
                  <Text className="text-white text-base font-semibold">
                    Request Data Download
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
