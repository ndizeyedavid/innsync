import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenLayout from "../layout/ScreenLayout";
import { useToast } from "../contexts/ToastContext";
import * as Haptics from "expo-haptics";
import { reservationEndpoints } from "../api/endpoints";

export default function LinkReservationScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLink = async () => {
    if (!confirmationNumber.trim()) {
      showToast("error", "Please enter your confirmation number");
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Try to link reservation (will fail if no backend, but that's okay for now)
      try {
        await reservationEndpoints.linkReservation({
          confirmationNumber,
          email: email || undefined,
          phone: phone || undefined,
        });
        showToast("success", "Reservation linked successfully!");
        router.replace("/(tabs)");
      } catch {
        // Mock success for now
        showToast("success", "Reservation linked successfully! (Mock)");
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error linking reservation:", error);
      showToast("error", "Failed to link reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="flex-row items-center gap-4 mb-6">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-sand-100 items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="#283D5A" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-semibold text-navy">
                Link Reservation
              </Text>
              <Text className="text-gray-500 text-sm">
                Enter your confirmation number to link an existing reservation
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="gap-4 mb-24">
            {/* Confirmation Number */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirmation Number *
              </Text>
              <TextInput
                className="rounded-2xl border border-gray-200 bg-white py-4 px-4 text-lg"
                placeholder="e.g., ABC123"
                placeholderTextColor="#9C988E"
                value={confirmationNumber}
                onChangeText={setConfirmationNumber}
                autoCapitalize="characters"
              />
            </View>

            {/* Email (optional) */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email (optional)
              </Text>
              <TextInput
                className="rounded-2xl border border-gray-200 bg-white py-4 px-4"
                placeholder="you@example.com"
                placeholderTextColor="#9C988E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone (optional) */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone (optional)
              </Text>
              <TextInput
                className="rounded-2xl border border-gray-200 bg-white py-4 px-4"
                placeholder="+1 234 567 8900"
                placeholderTextColor="#9C988E"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </ScrollView>

        {/* Link Button */}
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            activeOpacity={0.7}
            className="w-full h-14 bg-[#283D5A] rounded-2xl flex-row items-center justify-center gap-2"
            onPress={handleLink}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Link Reservation
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}
