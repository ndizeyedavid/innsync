import { TouchableOpacity } from "react-native";
import { Text, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

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
        onPress={() =>
          step != 1 ? setProgress((prev: any) => prev - 1) : null
        }
        className="size-[45px] bg-[#F5F4EF] items-center justify-center rounded-full"
      >
        <Ionicons name="chevron-back" size={25} className={"text-[#E8E5DD]"} />
      </TouchableOpacity>

      <View className="flex-row gap-[12px]">
        {[1, 2, 3, 4].map((index) => (
          <View
            key={index}
            className={`w-[50px] h-[4px] rounded-[2px] ${
              index < step + 1 ? "bg-black" : "bg-[#E8E5DD]"
            }`}
          />
        ))}
      </View>

      <TouchableOpacity className="size-[45px] bg-[#F5F4EF] items-center justify-center rounded-full">
        <Ionicons name="close" size={30} className="text-[#E8E5DD]" />
      </TouchableOpacity>
    </View>
  );
}
