import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

interface IWelcomeActionButton {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function WelcomeActionButton({
  icon,
  title,
  description,
  onPress,
  disabled = false,
  loading = false,
}: IWelcomeActionButton) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="bg-white p-5 gap-4 rounded-2xl w-full border border-gray-100"
      onPress={onPress}
      disabled={disabled || loading}
    >
      <View className="flex-row items-center gap-4">
        <View className="size-12 rounded-2xl bg-sand-100 items-center justify-center">
          <Ionicons name={icon} size={24} color="#283D5A" />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-xl font-semibold text-navy">{title}</Text>
          <Text className="text-sm text-gray-500">{description}</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}
