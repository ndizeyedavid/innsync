import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../hooks/useAuth";

export default function App() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/guest");
      }
    }
  }, [authLoading, isAuthenticated, router]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
