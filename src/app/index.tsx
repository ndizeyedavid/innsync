import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../hooks/useAuth";
import LoadingComponent from "../components/LoadingComponent";

export default function App() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (!authLoading) {
  //     if (isAuthenticated) {
  //       router.replace("/(tabs)");
  //     } else {
  //       router.replace("/guest");
  //     }
  //   }
  // }, [authLoading, isAuthenticated, router]);

  return <LoadingComponent />;
}
