import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import LoadingScreen from "../components/LoadingScreen";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleLoadingComplete = () => {
    setIsLoading(false);
    router.replace("/login");
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return <View className="flex-1" />;
}
