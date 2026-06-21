import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import housekeepingService from "../services/housekeeping.service";
import reservationsService from "../services/reservations.service";
import { GuestStay } from "../api/types";
import { useToast } from "../contexts/ToastContext";

type ServiceType = "cleaning" | "towels" | "amenities" | "maintenance";

const serviceOptions = [
  {
    type: "cleaning" as ServiceType,
    title: "Room Cleaning",
    description: "Make up the room",
    icon: "brush-outline",
  },
  {
    type: "towels" as ServiceType,
    title: "Fresh Towels",
    description: "Need more towels?",
    icon: "water-outline",
  },
  {
    type: "amenities" as ServiceType,
    title: "Extra Amenities",
    description: "Toiletries, pillows, etc.",
    icon: "bag-outline",
  },
  {
    type: "maintenance" as ServiceType,
    title: "Maintenance",
    description: "Something broken?",
    icon: "construct-outline",
  },
];

export default function HousekeepingScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [stays, setStays] = useState<GuestStay[]>([]);
  const [currentStay, setCurrentStay] = useState<GuestStay | null>(null);

  useEffect(() => {
    loadStays();
  }, []);

  const loadStays = async () => {
    try {
      const data = await reservationsService.listMine();
      setStays(data);
      const active = data.find((s) => s.status === "CHECKED_IN") || data[0];
      setCurrentStay(active);
    } catch (error) {
      console.error("Error loading stays:", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      showToast("error", "Please select a service type");
      return;
    }
    if (!currentStay) {
      showToast("error", "No active stay found");
      return;
    }

    try {
      setLoading(true);
      await housekeepingService.requestService(currentStay.id, selectedType, notes);
      showToast("success", "Service request submitted!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Reset form
      setSelectedType(null);
      setNotes("");
    } catch (error) {
      console.error("Error submitting request:", error);
      showToast("error", "Failed to submit request");
    } finally {
      setLoading(false);
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

      <TabHeader alt="SERVICES" title="Housekeeping" />

      <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-[18px] text-[#ACA9A0] mb-3">What do you need?</Text>

        <View className="gap-3 mb-6">
          {serviceOptions.map((option) => (
            <TouchableOpacity
              key={option.type}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedType(option.type);
              }}
              className={`p-4 rounded-2xl border-2 ${
                selectedType === option.type
                  ? "border-[#283D5A] bg-[#F0F4F8]"
                  : "border-[#EFEDE7] bg-white"
              }`}
            >
              <View className="flex-row items-center gap-3">
                <View 
                  className={`size-12 rounded-full items-center justify-center ${
                    selectedType === option.type 
                      ? "bg-[#283D5A]" 
                      : "bg-[#F5F4EF]"
                  }`}
                >
                  <Ionicons 
                    name={option.icon} 
                    size={24} 
                    color={selectedType === option.type ? "#fff" : "#283D5A"} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold">{option.title}</Text>
                  <Text className="text-sm text-[#6E6B63]">{option.description}</Text>
                </View>
                {selectedType === option.type && (
                  <Ionicons name="checkmark-circle" size={24} color="#283D5A" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-[18px] text-[#ACA9A0] mb-3">Additional notes</Text>
        <TextInput
          className="p-4 bg-white border border-[#EFEDE7] rounded-2xl text-base"
          placeholder="Any special instructions?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || !selectedType}
          className={`mt-6 p-4 rounded-2xl items-center ${
            loading || !selectedType ? "bg-[#ACA9A0]" : "bg-[#283D5A]"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-base font-semibold">Submit Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}
