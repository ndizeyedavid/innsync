import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import SelectField from "../SelectField";
import { roomOptions } from "../../constants/roomOptions";
import { bedTypes } from "../../constants/bedTypes";
import { floorPreference } from "../../constants/floorPreference";
import MealPlanButton from "../MealPlanButton";

export default function Preference() {
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const [selectedMealPlan, setSelectedMealPlan] = useState<number>(0);
  const mealPlans = [
    {
      id: 0,
      title: "Room only",
      description: "No meals included",
      alt: "Included",
    },
    {
      id: 1,
      title: "Breakfast",
      description: "Daily buffet breakfast",
      alt: "+$28/night",
    },
  ];

  return (
    <View className="mb-24">
      <View className="bg-white border border-[#E8E5DD] px-[20px] py-[24px] rounded-[10px] mt-6">
        <View className="flex-row items-center gap-[6px]">
          {/* <Ionicons name="calendar-clear-outline" size={20} /> */}
          <Text className="text-[16px] font-semibold ">Room Preferences</Text>
        </View>

        <View className="gap-4  mt-3">
          <View className="gap-2">
            <Text className="text-[15px] text-[#9C988E]">ROOM TYPE</Text>
            <SelectField
              label="Room Type"
              placeholder="Choose your room type"
              iconName="home-outline"
              items={roomOptions}
              selectedValue={selectedRoom}
              onValueChange={(value) => setSelectedRoom(value)}
            />
          </View>

          <View className="gap-2">
            <Text className="text-[15px] text-[#9C988E]">BED TYPE</Text>
            <SelectField
              label="Room Type"
              placeholder="Choose your bed style"
              iconName="bed-outline"
              items={bedTypes}
              selectedValue={selectedRoom}
              onValueChange={(value) => setSelectedRoom(value)}
            />
          </View>

          <View className="gap-2">
            <Text className="text-[15px] text-[#9C988E]">FLOOR PREFERENCE</Text>
            <SelectField
              label="Room Type"
              placeholder="Choose your floor preference"
              iconName="layers-outline"
              items={floorPreference}
              selectedValue={selectedRoom}
              onValueChange={(value) => setSelectedRoom(value)}
            />
          </View>
        </View>
      </View>

      <View className="bg-white border border-[#E8E5DD] px-[20px] py-[24px] rounded-[10px] mt-6">
        <View className="flex-row items-center gap-[6px] mb-[22px]">
          {/* <Ionicons name="calendar-clear-outline" size={20} /> */}
          <Text className="text-[16px] font-semibold ">Meal plan</Text>
        </View>

        <View className="gap-2">
          {mealPlans.map((data, index) => (
            <MealPlanButton
              key={index}
              id={data.id}
              title={data.title}
              description={data.description}
              alt={data.alt}
              checked={selectedMealPlan == index}
              setSelectedMealPlan={setSelectedMealPlan}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
