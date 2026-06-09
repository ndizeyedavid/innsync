import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { APP_CONFIG } from "../constants";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

export default function LoadingScreen({
  onLoadingComplete,
}: {
  onLoadingComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, APP_CONFIG.LOADING_DURATION);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <View className="flex-1 items-center justify-between bg-white py-12">
      {/* Top spacer */}
      <View className="h-0" />

      {/* Center logo */}
      <View className="items-center">
        <Ionicons name="planet-outline" size={90} color="#283D5A" />
        <Text className="text-3xl font-bold text-navy mt-4">InnSync</Text>
      </View>

      {/* Bottom loading indicator + text */}
      <View className="items-center gap-2">
        <ActivityIndicator size="small" color="#283D5A" />
        <Text className="text-gray-500">Loading your experience...</Text>
      </View>
    </View>
  );
}
