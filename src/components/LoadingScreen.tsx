import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { APP_CONFIG } from "../constants";

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
    <View className="flex-1 bg-blue-600 items-center justify-center">
      <View className="items-center">
        <ActivityIndicator size="large" color="white" className="mb-4" />
        <Text className="text-3xl font-bold text-white mb-2">InnSync</Text>
        <Text className="text-white opacity-80">
          Loading your experience...
        </Text>
      </View>
      <StatusBar style="light" />
    </View>
  );
}
