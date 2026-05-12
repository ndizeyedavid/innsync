import { useState } from "react";
import { View, Text } from "react-native";
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

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-gray-800">Loading complete!</Text>
    </View>
  );
}
