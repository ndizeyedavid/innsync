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
      className={`rounded-[8px] border border-[#E8E5DD] ${checked ? "bg-black" : "bg-white"} px-[22px] py-[18px] flex-row justify-between items-center`}
    >
      <View>
        <Text
          className={`text-[15px] font-semibold ${checked ? "text-white" : "text-black"}`}
        >
          {title}
        </Text>
        <Text className="text-[13px] text-[#716E67]">{description}</Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Text className="text-[13px] font-semibold text-[#716E67]">{alt}</Text>
        <View className="size-[20px] border rounded-full bg-white border-[#E8E5DD]">
          {checked && <Ionicons name="checkmark" size={20} color="black" />}
        </View>
      </View>
    </TouchableOpacity>
  );
}
