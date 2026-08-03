import { View, Text, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import WelcomeActionButton from "../components/welcome/WelcomeActionButton";
import { useToast } from "../contexts/ToastContext";
import * as Haptics from "expo-haptics";

export default function WelcomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleBookNewStay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/hotel-search");
  };

  const handleLinkExisting = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/link-reservation");
  };

  const handleBrowseApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(tabs)");
  };

  const getUserFirstName = () => {
    if (!user?.name) return "Guest";
    return user.name.split(" ")[0];
  };

  return (
    <View className="flex-1 bg-[#fafaf7] pt-16 px-6">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Logo & Welcome Text */}
        <View className="items-center mb-10">
          <Image
            source={require("../assets/images/logo/logo-single.png")}
            className="w-28 h-28 mb-4"
          />
          <Text className="text-4xl font-bold text-navy text-center">
            Welcome, {getUserFirstName()}!
          </Text>
          <Text className="text-lg text-gray-500 text-center mt-2">
            Great to have you here! What would you like to do first?
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="gap-4">
          <WelcomeActionButton
            icon="bed-outline"
            title="Book a New Stay"
            description="Reserve a room and personalize your stay"
            onPress={handleBookNewStay}
          />

          <WelcomeActionButton
            icon="receipt-outline"
            title="Link Existing Reservation"
            description="Connect a booking you already made"
            onPress={handleLinkExisting}
          />

          <WelcomeActionButton
            icon="compass-outline"
            title="Browse the App"
            description="Explore features and come back later"
            onPress={handleBrowseApp}
          />
        </View>
      </ScrollView>
    </View>
  );
}
