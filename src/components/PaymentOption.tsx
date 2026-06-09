import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

interface IPaymentOption {
  id: number;
  title: string;
  description: string;
  icon: string;
  checked: boolean;
  setSelectedPaymentOption: any;
}

export default function PaymentOption({
  id,
  title,
  description,
  icon,
  checked,
  setSelectedPaymentOption,
}: IPaymentOption) {
  return (
    <TouchableOpacity
      onPress={() => setSelectedPaymentOption(id)}
      className={`rounded-[8px] border border-gray-200 ${checked ? "bg-cobalt" : "bg-white"} px-[22px] py-[18px] flex-row justify-between items-center`}
    >
      <View className="flex-row gap-2 items-center">
        <View
          className={`p-2 ${checked ? "bg-navy" : "bg-sand-100"} rounded-lg`}
        >
          <Ionicons
            name={icon}
            size={24}
            color={`${checked ? "white" : "#283D5A"}`}
          />
        </View>
        <View>
          <Text
            className={`text-[15px] font-semibold ${checked ? "text-white" : "text-navy"}`}
          >
            {title}
          </Text>
          <Text className="text-[13px] text-gray-500">{description}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <View className="size-[20px] border rounded-full bg-white border-gray-200 items-center justify-center">
          {checked && <Ionicons name="checkmark" size={16} color="#283D5A" />}
        </View>
      </View>
    </TouchableOpacity>
  );
}
