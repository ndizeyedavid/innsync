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
      className={`rounded-[8px] border border-[#E8E5DD] ${checked ? "bg-black" : "bg-white"} px-[22px] py-[18px] flex-row justify-between items-center`}
    >
      <View className="flex-row gap-2 items-center">
        <View
          className={`p-2 ${checked ? "bg-[#232321]" : "bg-[#f5f4ef]"} rounded-lg`}
        >
          <Ionicons
            name={icon}
            size={24}
            color={`${checked ? "white" : "black"}`}
          />
        </View>
        <View>
          <Text
            className={`text-[15px] font-semibold ${checked ? "text-white" : "text-black"}`}
          >
            {title}
          </Text>
          <Text className="text-[13px] text-[#716E67]">{description}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <View className="size-[20px] border rounded-full bg-white border-[#E8E5DD] items-center justify-center">
          {checked && <Ionicons name="checkmark" size={16} color="black" />}
        </View>
      </View>
    </TouchableOpacity>
  );
}
