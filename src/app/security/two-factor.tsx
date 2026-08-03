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
import TabHeader from "../../components/TabHeader";
import ScreenLayout from "../../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import { useToast } from "../../contexts/ToastContext";

export default function TwoFactorScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"initial" | "setup" | "verify">("initial");
  const [code, setCode] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");

  // TODO: Load current 2FA status from backend
  useEffect(() => {
    const loadStatus = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    };
    loadStatus();
  }, []);

  const handleEnable = async () => {
    try {
      setIsLoading(true);
      // TODO: Call backend to start 2FA setup and get QR code/secret
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data for demo
      setQrUrl(
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Innsync:user@example.com?secret=JBSWY3DPEHPK3PXP",
      );
      setSecret("JBSWY3DPEHPK3PXP");
      setStep("setup");
    } catch (error) {
      console.error("Enable 2FA error:", error);
      showToast("error", "Failed to start 2FA setup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      showToast("error", "Please enter a valid 6-digit code");
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Call backend to verify code and enable 2FA
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsEnabled(true);
      setStep("initial");
      showToast("success", "Two-Factor Authentication enabled!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Verify 2FA error:", error);
      showToast("error", "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      setIsLoading(true);
      // TODO: Call backend to disable 2FA
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsEnabled(false);
      showToast("success", "Two-Factor Authentication disabled");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Disable 2FA error:", error);
      showToast("error", "Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setStep("initial");
    setCode("");
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

      <TabHeader alt="SECURITY" title="Two-Factor Auth" />

      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-4">
          {step === "initial" ? (
            <View className="gap-4">
              <View className="flex-row items-start gap-3">
                <View className="size-10 bg-[#F5F4EF] rounded-full items-center justify-center">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={isEnabled ? "#3F6B4F" : "#9C988E"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold">
                    {isEnabled
                      ? "Two-Factor Authentication is Enabled"
                      : "Enable Two-Factor Authentication"}
                  </Text>
                  <Text className="text-sm text-[#6E6B63] mt-1">
                    {isEnabled
                      ? "Your account is protected by an extra layer of security"
                      : "Add an extra layer of security to your account by requiring a verification code when you log in"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={isEnabled ? handleDisable : handleEnable}
                disabled={isLoading}
                className={`py-3 rounded-xl mt-4 items-center flex-row justify-center gap-2 ${
                  isEnabled ? "bg-red-50" : "bg-black"
                } ${isLoading ? "opacity-50" : ""}`}
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={isEnabled ? "#DC2626" : "white"}
                  />
                ) : (
                  <>
                    <Ionicons
                      name={
                        isEnabled
                          ? "shield-outline"
                          : "shield-checkmark-outline"
                      }
                      size={20}
                      color={isEnabled ? "#DC2626" : "white"}
                    />
                    <Text
                      className={`text-base font-semibold ${
                        isEnabled ? "text-red-600" : "text-white"
                      }`}
                    >
                      {isEnabled
                        ? "Disable Two-Factor Auth"
                        : "Enable Two-Factor Auth"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : step === "setup" ? (
            <View className="gap-4">
              <View className="items-center">
                <Text className="text-lg font-semibold mb-2">Scan QR Code</Text>
                <Text className="text-sm text-[#6E6B63] text-center mb-4">
                  Scan this QR code with your authenticator app
                </Text>
                {/* TODO: Replace with real QR code component */}
                <View className="w-48 h-48 bg-gray-100 rounded-xl items-center justify-center">
                  <Ionicons name="qr-code-outline" size={64} color="#9C988E" />
                  <Text className="text-sm text-[#6E6B63] mt-2 text-center">
                    QR Code Placeholder
                  </Text>
                </View>
              </View>

              <View className="bg-[#F5F4EF] rounded-xl p-4">
                <Text className="text-xs text-[#A4A097] mb-1">
                  Manual Setup Key
                </Text>
                <Text className="text-base font-mono">{secret}</Text>
              </View>

              <View className="mt-4">
                <Text className="text-xs text-[#A4A097] mb-1">
                  Enter Verification Code
                </Text>
                <TextInput
                  className="border border-[#EFEDE7] rounded-xl p-3 text-center text-2xl font-semibold tracking-widest"
                  placeholder="000000"
                  value={code}
                  onChangeText={(text) =>
                    setCode(text.replace(/[^0-9]/g, "").slice(0, 6))
                  }
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="flex-1 py-3 rounded-xl border border-[#EFEDE7] items-center"
                  disabled={isLoading}
                >
                  <Text className="text-base font-semibold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleVerify}
                  disabled={isLoading || code.length < 6}
                  className="flex-1 py-3 rounded-xl bg-black items-center flex-row justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-outline"
                        size={20}
                        color="white"
                      />
                      <Text className="text-white text-base font-semibold">
                        Verify
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>

        {step === "initial" && (
          <View className="bg-[#F5F4EF] rounded-2xl p-4">
            <Text className="text-base font-semibold mb-2">
              What is Two-Factor Authentication?
            </Text>
            <Text className="text-sm text-[#6E6B63]">
              Two-factor authentication adds an extra layer of security to your
              account. When enabled, you'll need to enter a verification code
              from your authenticator app in addition to your password when
              logging in.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
