import React from "react";
import { Text, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

export default function PaymentSummary() {
  return (
    <View className="flex-row justify-between">
      <View className="gap-1">
        <Text className="text-[15px] font-semibold text-[#9C988E]">Total</Text>
        <Text className="text-[30px]">$2849</Text>
      </View>

      <View className="flex-row items-center gap-1">
        <Ionicons name="lock-closed" size={15} />
        <Text className="text-[13px] text-[#6E6B63]">
          Secured by 3-D Secure
        </Text>
      </View>
    </View>
  );
}
