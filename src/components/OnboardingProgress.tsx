import { TouchableOpacity } from "react-native";
import { Text, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";

export default function OnboardingProgress({
  step,
  setProgress,
}: {
  step: number;
  setProgress: any;
}) {
  return (
    <View className="mb-[22px] mt-5 flex-row items-center justify-between px-2">
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          step != 1 ? setProgress((prev: any) => prev - 1) : null;
        }}
        className="size-[45px] bg-sand-100 items-center justify-center rounded-full"
      >
        <Ionicons name="chevron-back" size={25} color="#9CA3AF" />
      </TouchableOpacity>

      <View className="flex-row gap-[12px]">
        {[1, 2, 3, 4].map((index) => (
          <View
            key={index}
            className={`w-[50px] h-[4px] rounded-[2px] ${
              index < step + 1 ? "bg-cobalt" : "bg-gray-200"
            }`}
          />
        ))}
      </View>

      <TouchableOpacity className="size-[45px] bg-sand-100 items-center justify-center rounded-full">
        <Ionicons name="close" size={30} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}
