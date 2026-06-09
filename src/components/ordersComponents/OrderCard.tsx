import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

interface IOrderCard {
  image: any;
  title: string;
  description: string;
  price: string;
  time: string;
}

export default function OrderCard({
  image,
  title,
  description,
  price,
  time,
}: IOrderCard) {
  return (
    <View className="flex-row items-center rounded-2xl border border-[#EFEDE7] bg-white px-[7px] py-[14px] gap-3">
      <Image source={image} className="size-[92px] rounded-[8px] bg-gray-400" />

      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-[16px] line-clamp-1 flex-1">{title}</Text>
          <Text className="text-[18px] font-semibold text-right flex-shrink-0">
            {price}
          </Text>
        </View>
        <Text className="text-[12px] text-[#A4A097] line-clamp-2">
          {description}
        </Text>
        <View className="flex-row items-center justify-between gap-2 mt-1">
          <View className="flex-row gap-1 items-center flex-shrink-0">
            <Ionicons name="timer-outline" color="black" size={20} />
            <Text className="text-[12px] text-[#A4A097]">{time}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            className="px-[13px] py-[6px] bg-black rounded-3xl flex-row items-center gap-2 flex-shrink-0"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white">Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
