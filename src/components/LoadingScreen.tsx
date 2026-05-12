import { useEffect, useState } from "react";
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
    <View className="flex-1 bg-white items-center justify-center">
      <View className="items-center">
        <Ionicons name="planet-outline" size={90} className="mb-8" />
        <Text className="text-3xl font-bold  mb-2">InnSync</Text>
        {/* <Text className=" opacity-80">Loading your experience...</Text> */}
        <ActivityIndicator size="small" className="mt-4" />
      </View>
    </View>
  );
}
