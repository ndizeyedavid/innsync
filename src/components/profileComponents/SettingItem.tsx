import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

interface ISettingItem {
  icon: string;
  title: string;
  description: string;
  onPress?: () => void;
  isLast?: boolean;
}

export default function SettingItem({
  icon,
  title,
  description,
  onPress,
  isLast = false,
}: ISettingItem) {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between px-[22px] py-[20px] ${isLast ? "" : "border-b border-[#EFEDE7]"}`}
      onPress={onPress}
    >
      <View className="flex-row items-center gap-2">
        <View className="size-[43px] rounded-lg bg-[#F5F4EF] items-center justify-center">
          <Ionicons name={icon} size={25} color="black" />
        </View>
        <View className="gap-1">
          <Text className="text-[15px] font-semibold">{title}</Text>
          <Text className="text-[12px] text-[#A09C92]">{description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#9C988E" />
    </TouchableOpacity>
  );
}
