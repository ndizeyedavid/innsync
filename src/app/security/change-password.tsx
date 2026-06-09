import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../../components/TabHeader";
import ScreenLayout from "../../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import { useToast } from "../../contexts/ToastContext";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      showToast("error", "Password must be at least 8 characters long");
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Call backend API when available
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      showToast("success", "Password changed successfully!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Change password error:", error);
      showToast("error", "Failed to change password. Please check your current password.");
    } finally {
      setIsLoading(false);
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

      <TabHeader alt="SECURITY" title="Change Password" />

      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-4">
          {/* Current Password */}
          <View className="mb-4">
            <Text className="text-xs text-[#A4A097] mb-1">Current Password</Text>
            <View className="border border-[#EFEDE7] rounded-xl flex-row items-center px-3 py-3">
              <TextInput
                className="flex-1 text-base"
                placeholder="Enter your current password"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
                textContentType="password"
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                <Ionicons
                  name={showCurrent ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9C988E"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View className="mb-4">
            <Text className="text-xs text-[#A4A097] mb-1">New Password</Text>
            <View className="border border-[#EFEDE7] rounded-xl flex-row items-center px-3 py-3">
              <TextInput
                className="flex-1 text-base"
                placeholder="Enter new password"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
                textContentType="newPassword"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Ionicons
                  name={showNew ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9C988E"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password */}
          <View className="mb-4">
            <Text className="text-xs text-[#A4A097] mb-1">Confirm New Password</Text>
            <View className="border border-[#EFEDE7] rounded-xl flex-row items-center px-3 py-3">
              <TextInput
                className="flex-1 text-base"
                placeholder="Confirm new password"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                textContentType="newPassword"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons
                  name={showConfirm ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9C988E"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Change Password Button */}
        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={isLoading}
          className={`bg-black py-4 rounded-2xl mt-2 items-center flex-row justify-center gap-2 ${
            isLoading ? "opacity-50" : ""
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="lock-open-outline" size={20} color="white" />
              <Text className="text-white text-base font-semibold">Change Password</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}
