import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import SelectField from "../SelectField";
import { roomOptions } from "../../constants/roomOptions";
import { bedTypes } from "../../constants/bedTypes";
import { floorPreference } from "../../constants/floorPreference";

export default function Preference() {
  const [selectedRoom, setSelectedRoom] = useState<string>();
  return (
    <View>
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

      <View className="bg-white border border-[#E8E5DD] px-[20px] py-[24px] rounded-[10px] mt-6 mb-9">
        <View className="flex-row items-center gap-[6px] mb-[22px]">
          {/* <Ionicons name="calendar-clear-outline" size={20} /> */}
          <Text className="text-[16px] font-semibold ">Meal plan</Text>
        </View>

        <View className="rounded-[8px] border border-[#E8E5DD] bg-white px-[22px] py-[18px] flex-row justify-between items-center">
          <View>
            <Text className="text-[15px] font-semibold">Room Only</Text>
            <Text className="text-[13px] text-[#716E67]">
              No meals included
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Text className="text-[13px] font-semibold text-[#716E67]">
              Included
            </Text>
            <View className="size-[20px] border rounded-full bg-white border-[#E8E5DD]"></View>
          </View>
        </View>

        <View className="rounded-[8px] mt-2 border border-[#E8E5DD] bg-white px-[22px] py-[18px] flex-row justify-between items-center">
          <View>
            <Text className="text-[15px] font-semibold">Breakfast</Text>
            <Text className="text-[13px] text-[#716E67]">
              Daily buffet breakfast
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Text className="text-[13px] font-semibold text-[#716E67]">
              +$28/night
            </Text>
            <View className="size-[20px] border rounded-full bg-white border-[#E8E5DD]">
              <Ionicons name="checkmark" size={20} color="white" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
