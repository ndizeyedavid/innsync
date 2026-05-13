import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

export default function NumberStepper() {
  const [count, setCount] = useState<number>(0);
  return (
    <View className="flex-row items-center justify-between gap-7">
      <TouchableOpacity
        onPress={() => setCount((prev) => prev - 1)}
        className="size-[40px] border border-[#F5F4EF] items-center justify-center rounded-full"
      >
        <Ionicons name="remove" size={30} className={"text-[#E8E5DD]"} />
      </TouchableOpacity>
      <Text className="font-semibold text-[15px]">{count}</Text>
      <TouchableOpacity
        onPress={() => setCount((prev) => prev + 1)}
        className="size-[35px] border border-[#F5F4EF] items-center justify-center rounded-full"
      >
        <Ionicons name="add" size={30} className={"text-[#E8E5DD]"} />
      </TouchableOpacity>
    </View>
  );
}
