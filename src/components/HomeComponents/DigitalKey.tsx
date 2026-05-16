import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

export default function DigitalKey() {
  return (
    <View className="gap-6 bg-black items-center rounded-3xl py-5">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-[13px] text-[#989896]">DIGITAL KEY</Text>
          <Text className="text-[32px] text-white">Suite 1207</Text>
          <Text className="text-[12px] text-[#989896]">
            Sereno Bay Resort - until April 30
          </Text>
        </View>

        {/* Active Badge */}
        <View className="px-[11px] py-[5px] bg-[#D9D9D9] flex-row gap-1 items-center rounded-2xl">
          <View className="size-[6px] bg-[#3F6B4F] rounded-full" />
          <Text className="text-[13px] text-[#3F6B4F]">active</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        className="size-[137px] bg-white items-center justify-center rounded-full"
      >
        <Ionicons name="lock-closed" size={40} color="black" />
      </TouchableOpacity>

      <View>
        <Text className="text-[32px] text-white">Tap to unlock</Text>
        <Text className="text-[13px] text-[#959592]">
          Hold near the door for 1 second
        </Text>
      </View>
    </View>
  );
}
