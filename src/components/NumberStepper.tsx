import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export default function NumberStepper({
  value,
  onChange,
  min = 0,
}: NumberStepperProps) {
  return (
    <View className="flex-row items-center justify-between gap-7">
      <TouchableOpacity
        onPress={() => onChange(Math.max(min, value - 1))}
        className="size-[40px] border border-[#F5F4EF] items-center justify-center rounded-full"
      >
        <Ionicons name="remove" size={30} className={"text-[#E8E5DD]"} />
      </TouchableOpacity>
      <Text className="font-semibold text-[15px]">{value}</Text>
      <TouchableOpacity
        onPress={() => onChange(value + 1)}
        className="size-[35px] border border-[#F5F4EF] items-center justify-center rounded-full"
      >
        <Ionicons name="add" size={30} className={"text-[#E8E5DD]"} />
      </TouchableOpacity>
    </View>
  );
}
