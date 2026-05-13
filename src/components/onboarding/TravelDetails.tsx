import React, { useState } from "react";
import { Text, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import DatePickerSheet from "../DateInput";
import NumberStepper from "../NumberStepper";

interface ITravelDetails {
  checkIn: Date | null;
  checkOut: Date | null;

  setCheckIn: any;
  setCheckOut: any;
}

export default function TravelDetails({
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
}: ITravelDetails) {
  return (
    <View>
      <View className="bg-white border border-[#E8E5DD] px-[20px] py-[24px] rounded-[10px] mt-6">
        <View className="flex-row items-center gap-[6px]">
          <Ionicons name="calendar-clear-outline" size={20} />
          <Text className="text-[15px] font-semibold ">Dates</Text>
        </View>

        <View className="flex-row justify-between gap-3">
          <View className="gap-2 mt-[21px] flex-1">
            <Text className="text-[15px] text-[#9C988E]">CHECK-IN</Text>
            <DatePickerSheet
              label="Check-In"
              value={checkIn}
              onChangeDate={(date) => {
                setCheckIn(date);
                // Clear invalid checkout selections automatically
                if (checkOut && date > checkOut) setCheckOut(null);
              }}
              minimumDate={new Date()} // Can't book past days
            />
          </View>
          <View className="gap-2 mt-[21px] flex-1">
            <Text className="text-[15px]  text-[#9C988E]">CHECK-OUT</Text>
            <DatePickerSheet
              label="Check-Out"
              value={checkOut}
              onChangeDate={(date) => setCheckOut(date)}
              minimumDate={checkIn || new Date()} // Forces checkout to be after checkin selection
            />
          </View>
        </View>
      </View>

      <View className="bg-white border border-[#E8E5DD] px-[20px] py-[24px] rounded-[10px] mt-6">
        <View className="flex-row items-center gap-[6px]">
          <Ionicons name="people" size={20} />
          <Text className="text-[15px] font-semibold ">Guests</Text>
        </View>

        <View className="flex-row items-center justify-between mt-[22px]">
          <Text className="text-[15px] font-semibold">Adults</Text>
          <NumberStepper />
        </View>

        <View className="flex-row items-center justify-between mt-[22px]">
          <View>
            <Text className="text-[15px] font-semibold">Children</Text>
            <Text className="text-[12px] font-400 text-[#9C988E]">
              Under 12
            </Text>
          </View>

          <NumberStepper />
        </View>
      </View>
    </View>
  );
}
