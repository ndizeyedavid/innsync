import SignupScreen from "../screens/SignupScreen";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { View, ActivityIndicator } from "react-native";
import LoadingComponent from "../components/LoadingComponent";

export default function Signup() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingComponent />;
  }

  return <SignupScreen />;
}
