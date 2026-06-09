import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

interface IVibeButton {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onPress: any;
}

export default function VibeButton({
  icon,
  title,
  description,
  checked,
  onPress,
}: IVibeButton) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`relative gap-2 items-center justify-center w-[155px] h-[150px] border rounded-[8px] ${checked ? "bg-cobalt border-cobalt" : "bg-white border-gray-200"}`}
    >
      <Text className="text-[40px] ">{icon}</Text>
      <View className="items-center">
        <Text
          className={`text-[20px] ${checked ? "text-white" : "text-navy"}`}
        >
          {title}
        </Text>
        <Text className="text-[14px] text-gray-500">{description}</Text>
      </View>
      {checked && (
        <View className="absolute top-3 right-3 size-[25px] border rounded-full bg-white border-gray-200 items-center justify-center">
          <Ionicons name="checkmark" size={15} color="#283D5A" />
        </View>
      )}
    </TouchableOpacity>
  );
}
