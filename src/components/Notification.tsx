import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
export default function Notification() {
  return (
    <View className="flex-row items-center justify-between  bg-[#F4F0E9] border border-[#7E7A72] px-2 py-4 rounded-lg">
      <View className="flex-row gap-2 items-center">
        <View className="size-[30px] items-center justify-center bg-[#B8956A] rounded-full">
          <Ionicons name="sunny" color="white" size={21} />
        </View>

        <View className="gap-px">
          <Text className="text-[15px] font-bold">
            Your sunrise yoga starts at 8:00
          </Text>
          <Text className="text-[12px] text-[#7E7A72]">
            Deck Pavilion · 3 min walk from your room
          </Text>
        </View>
      </View>

      <TouchableOpacity>
        <Ionicons name="close" color="black" size={22} />
      </TouchableOpacity>
    </View>
  );
}
