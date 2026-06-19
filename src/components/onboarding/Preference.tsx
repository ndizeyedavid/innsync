import React from "react";
import { Text, TextInput, View, TouchableOpacity } from "react-native";
import SelectField from "../SelectField";
import { roomOptions } from "../../constants/roomOptions";
import { bedTypes } from "../../constants/bedTypes";
import { floorPreference } from "../../constants/floorPreference";
import MealPlanButton from "../MealPlanButton";
import { mealPlans } from "../../constants/mealPlans";
import { dietaryRestrictionOptions } from "../../constants/dietaryRestrictions";

interface PreferenceProps {
  roomPreference: string | undefined;
  setRoomPreference: (value: string | undefined) => void;
  bedPreference: string | undefined;
  setBedPreference: (value: string | undefined) => void;
  floorPreference: string | undefined;
  setFloorPreference: (value: string | undefined) => void;
  selectedMealPlanId: string;
  setSelectedMealPlanId: (id: string) => void;
  specialRequests: string | undefined;
  setSpecialRequests: (value: string | undefined) => void;
  dietaryRestrictions: string[];
  setDietaryRestrictions: (restrictions: string[]) => void;
}

export default function Preference({
  roomPreference,
  setRoomPreference,
  bedPreference,
  setBedPreference,
  floorPreference,
  setFloorPreference,
  selectedMealPlanId,
  setSelectedMealPlanId,
  specialRequests,
  setSpecialRequests,
  dietaryRestrictions,
  setDietaryRestrictions,
}: PreferenceProps) {
  const toggleDietaryRestriction = (restriction: string) => {
    if (dietaryRestrictions.includes(restriction)) {
      setDietaryRestrictions(
        dietaryRestrictions.filter((r) => r !== restriction),
      );
    } else {
      setDietaryRestrictions([...dietaryRestrictions, restriction]);
    }
  };

  return (
    <View className="mb-24">
      <View className="bg-white border border-gray-200 px-[20px] py-[24px] rounded-[10px] mt-6">
        <View className="flex-row items-center gap-[6px]">
          <Text className="text-[16px] font-semibold ">Room Preferences</Text>
        </View>

        <View className="gap-4 mt-3">
          <View className="gap-2">
            <Text className="text-[15px] text-[#9C988E]">ROOM TYPE</Text>
            <SelectField
              label="Room Type"
              placeholder="Choose your room type"
              iconName="home-outline"
              items={roomOptions}
              selectedValue={roomPreference}
              onValueChange={setRoomPreference}
            />
          </View>

          <View className="gap-2">
            <Text className="text-[15px] text-[#9C988E]">BED TYPE</Text>
            <SelectField
              label="Bed Type"
              placeholder="Choose your bed style"
              iconName="bed-outline"
              items={bedTypes}
              selectedValue={bedPreference}
              onValueChange={setBedPreference}
            />
          </View>

          <View className="gap-2">
            <Text className="text-[15px] text-gray-500">FLOOR PREFERENCE</Text>
            <SelectField
              label="Floor Preference"
              placeholder="Choose your floor preference"
              iconName="layers-outline"
              items={floorPreference}
              selectedValue={floorPreference}
              onValueChange={setFloorPreference}
            />
          </View>
        </View>
      </View>

      <View className="bg-white border border-gray-200 px-[20px] py-[24px] rounded-[10px] mt-6">
        <View className="flex-row items-center gap-[6px] mb-[22px]">
          <Text className="text-[16px] font-semibold ">Meal plan</Text>
        </View>

        <View className="gap-2">
          {mealPlans.map((data) => (
            <MealPlanButton
              key={data.id}
              id={data.id}
              title={data.title}
              description={data.description}
              alt={data.alt}
              checked={selectedMealPlanId === data.id}
              setSelectedMealPlan={setSelectedMealPlanId}
            />
          ))}
        </View>
      </View>

      <View className="bg-white border border-gray-200 px-[20px] py-[24px] rounded-[10px] mt-6">
        <View className="flex-row items-center gap-[6px] mb-[14px]">
          <Text className="text-[16px] font-semibold ">
            Dietary Restrictions
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {dietaryRestrictionOptions.map((restriction) => (
            <TouchableOpacity
              key={restriction}
              className={`px-4 py-2 rounded-full border ${
                dietaryRestrictions.includes(restriction)
                  ? "bg-black border-black"
                  : "bg-white border-gray-200"
              }`}
              onPress={() => toggleDietaryRestriction(restriction)}
            >
              <Text
                className={`text-sm ${
                  dietaryRestrictions.includes(restriction)
                    ? "text-white"
                    : "text-black"
                }`}
              >
                {restriction}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="bg-white border border-gray-200 px-[20px] py-[24px] rounded-[10px] mt-6">
        <View className="flex-row items-center gap-[6px] mb-[14px]">
          <Text className="text-[16px] font-semibold text-navy">Special Requests</Text>
        </View>
        <TextInput
          className="border border-gray-200 rounded-lg px-4 py-3 text-base"
          placeholder="Any special requests or notes..."
          value={specialRequests}
          onChangeText={setSpecialRequests}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );
}
