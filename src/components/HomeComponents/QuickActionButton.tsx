import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

interface IQuickActionButton {
  icon: string;
  title: string;
  description: string;
}

export default function QuickActionButton({
  icon,
  title,
  description,
}: IQuickActionButton) {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      className="bg-white p-3 pb-5 gap-[16px] rounded-2xl w-[48%]"
    >
      <View className="size-[40px] rounded-xl bg-[#F5F4EF] items-center justify-center">
        <Ionicons name={icon} size={20} color="black" />
      </View>
      <View className="gap-1">
        <Text className="text-[20px]">{title}</Text>
        <Text className="text-[13px] text-[#9C988E]">{description}</Text>
      </View>
    </TouchableOpacity>
  );
}
