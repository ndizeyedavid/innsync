import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

interface IMealPlanButton {
  id: "room-only" | "breakfast" | "half-board" | "full-board";
  title: string;
  description: string;
  alt: string;
  checked: boolean;
  setSelectedMealPlan: (id: string) => void;
}

export default function MealPlanButton({
  id,
  title,
  description,
  alt,
  checked,
  setSelectedMealPlan,
}: IMealPlanButton) {
  return (
    <TouchableOpacity
      onPress={() => setSelectedMealPlan(id)}
      className={`rounded-[8px] border border-gray-200 ${checked ? "bg-cobalt" : "bg-white"} px-[22px] py-[18px] flex-row justify-between items-center`}
    >
      <View>
        <Text
          className={`text-[15px] font-semibold ${checked ? "text-white" : "text-navy"}`}
        >
          {title}
        </Text>
        <Text className="text-[13px] text-gray-500">{description}</Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Text className="text-[13px] font-semibold text-gray-500">{alt}</Text>
        <View className="size-[20px] border rounded-full bg-white border-gray-200 items-center justify-center">
          {checked && <Ionicons name="checkmark" size={16} color="#283D5A" />}
        </View>
      </View>
    </TouchableOpacity>
  );
}
