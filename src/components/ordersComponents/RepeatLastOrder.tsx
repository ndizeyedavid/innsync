import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

export default function RepeatLastOrder() {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      className="flex-row items-center justify-between  bg-white border border-[#EFEDE7] px-2 py-4 rounded-xl"
    >
      <View className="flex-row gap-2 items-center justify-between">
        <View className="size-[45px] items-center justify-center bg-[#F5F4EF] rounded-full">
          <Ionicons name="refresh" color="black" size={27} />
        </View>

        <View className="gap-1 w-fit ">
          <Text className="text-[12px] text-[#7E7A72] uppercase">
            REPEAT LAST ORDER
          </Text>
          <Text className="text-[15px] font-bold line-clamp-1 w-[90%]">
            Continental breakfast tray asdas
          </Text>
        </View>
      </View>

      <TouchableOpacity>
        <Ionicons name="arrow-forward" color="black" size={22} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
