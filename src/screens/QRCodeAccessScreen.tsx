import { Text, TouchableOpacity, View } from "react-native";
import { useState, useEffect } from "react";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import {
  getQrAccessToken,
  generateQrAccessToken,
} from "../utils/storage";
import QRCode from "react-native-qrcode-svg";

export default function QRCodeAccessScreen() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    setLoading(true);
    let t = await getQrAccessToken();
    if (!t) {
      t = await generateQrAccessToken();
    }
    setToken(t);
    setLoading(false);
  };

  const handleRegenerate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const t = await generateQrAccessToken();
    setToken(t);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const qrValue = token
    ? JSON.stringify({
        type: "innsync_door_access",
        token,
        generated: Date.now(),
      })
    : "";

  return (
    <ScreenLayout>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        className="mb-4"
      >
        <Ionicons name="arrow-back" size={24} color="#283D5A" />
      </TouchableOpacity>

      <View className="flex-1 items-center px-2">
        <Text className="text-2xl font-bold text-navy mb-1">QR Code Access</Text>
        <Text className="text-sm text-gray-500 text-center mb-6">
          Scan this QR code at the door to unlock
        </Text>

        {loading ? (
          <View className="size-64 rounded-2xl bg-sand-100 items-center justify-center">
            <Ionicons name="qr-code-outline" size={48} color="#D1D5DB" />
          </View>
        ) : (
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <QRCode
              value={qrValue}
              size={260}
              color="#283D5A"
              backgroundColor="#fff"
            />
          </View>
        )}

        {token && (
          <View className="mt-6 bg-sand-100 rounded-2xl p-4 w-full">
            <Text className="text-xs text-gray-500 mb-1">ACCESS TOKEN</Text>
            <Text className="text-sm font-mono text-navy selectable">
              {token}
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="bg-navy rounded-2xl py-4 px-8 items-center mt-6"
          onPress={handleRegenerate}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="refresh-outline" size={20} color="white" />
            <Text className="text-white font-semibold text-lg">
              Regenerate Code
            </Text>
          </View>
        </TouchableOpacity>

        <View className="bg-sand-100 rounded-2xl p-4 mt-6 w-full">
          <Text className="text-xs text-gray-500 leading-relaxed">
            This QR code is stored locally on your device. Present it to the
            door scanner for entry. Regenerating will invalidate the old code.
          </Text>
        </View>
      </View>
    </ScreenLayout>
  );
}