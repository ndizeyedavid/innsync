import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

interface ItenraryCardProps {
  image: any;
  time: string;
  isBooked: boolean;
  title: string;
  location: string;
  description: string;
  isIncluded: boolean;
  isConfirmed: boolean;
}

export default function ItineraryCard({
  image,
  time,
  isBooked,
  title,
  location,
  description,
  isIncluded,
  isConfirmed,
}: ItenraryCardProps) {
  return (
    <View className="rounded-2xl overflow-hidden bg-white relative">
      {/* Heading */}
      <View className="absolute z-20 flex-1 w-full px-2 top-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1 px-[11px] py-[5px] bg-[#D9D9D9] rounded-2xl">
            <Ionicons name="time-outline" size={20} color="black" />
            <Text>{time}</Text>
          </View>

          {isBooked && (
            <View className="flex-row items-center gap-1 px-[11px] py-[5px] bg-[#D9D9D9] rounded-2xl">
              <Ionicons name="checkmark" size={20} color="green" />
              <Text className="text-green-700">BOOKED</Text>
            </View>
          )}
        </View>
      </View>
      {/* Overlay */}
      <View className="bg-navy/20 absolute h-[205px] w-full z-10" />

      {/* Image */}
      <Image
        source={image}
        style={{
          objectFit: "cover",
          height: 205,
        }}
        className="bg-gray-300"
      />

      <View className="px-3 mt-4">
        <Text className="text-[24px] font-semibold text-navy">{title}</Text>
        <View className="flex-row items-center gap-1 mt-2">
          <Ionicons name="location" size={20} color="#9CA3AF" />
          <Text className="text-gray-500 text-[14px]">{location}</Text>
        </View>

        <Text className="text-[14px] text-gray-500 mt-3">{description}</Text>

        <View className="flex-row items-center justify-between my-[18px]">
          <Text className="text-[24px] font-semibold text-navy">
            {isIncluded ? "Included" : "Not Included"}
          </Text>

          {isConfirmed ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="checkmark" size={20} color="#10B981" />
              <Text className="text-success font-semibold">Confirmed</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1">
              <Ionicons name="close" size={20} color="#EF4444" />
              <Text className="text-error font-semibold">Unconfirmed</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
