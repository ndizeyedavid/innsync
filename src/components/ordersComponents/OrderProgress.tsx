import { Text, TextInput, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

export default function OrderProgress() {
  return (
    <View className="bg-white border border-[#EFEDE7] rounded-3xl px-4 py-5 w-[312px]">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center gap-2">
          <View className="px-[11px] py-[5px] bg-[#D9D9D9] flex-row gap-1 items-center rounded-2xl">
            <View className="size-[6px] bg-[#3F6B4F] rounded-full" />
            <Text className="text-[13px] text-[#3F6B4F]">Delivered</Text>
          </View>

          <Text className="text-[#9C988E] text-[15px]">ETA IN 18 MIN</Text>
        </View>

        <View>
          <Text className="text-[24px] text-right">$72</Text>
          <Text className="text-right text-[10px]">CHARGED TO</Text>
          <Text className="text-right text-[10px]">ROOM</Text>
        </View>
      </View>

      <Text className="text-[23px] font-semibold">
        2x Hibiscus spritz, 1x Coconut crusted prawns
      </Text>

      <View className="mt-5">
        <View className="w-full bg-black h-[5px] rounded-[15px]" />
        <View className="flex-row items-center justify-center gap-6 mt-4">
          <ProgressChecker text="Preparing" isComplete={true} />
          <ProgressChecker text="On the way" isComplete={true} />
          <ProgressChecker text="Delivered" isComplete={false} />
        </View>
      </View>
    </View>
  );
}

interface IProgressChecker {
  isComplete: boolean;
  text: string;
}

function ProgressChecker({ text, isComplete }: IProgressChecker) {
  return (
    <View className="items-center justify-center gap-2">
      <View
        className={`size-[40px] rounded-full items-center justify-center ${isComplete && "bg-black"} border border-[#EFEDE7]`}
      >
        <Ionicons name="checkmark" color="white" size={30} />
      </View>
      <Text className="text-[11px] uppercase">{text}</Text>
    </View>
  );
}
