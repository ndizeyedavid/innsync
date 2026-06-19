import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";

interface Amenity {
  id: string;
  name: string;
  icon: string;
}

interface AmenitiesSectionProps {
  amenities: Amenity[];
  selectedAmenities: string[];
  onToggleAmenity: (amenityId: string) => void;
}

export default function AmenitiesSection({
  amenities,
  selectedAmenities,
  onToggleAmenity,
}: AmenitiesSectionProps) {
  return (
    <View className="mt-6">
      <Text className="text-xl font-semibold text-navy mb-4">Filter by Amenities</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {amenities.map((amenity) => {
          const isSelected = selectedAmenities.includes(amenity.id);
          return (
            <TouchableOpacity
              key={amenity.id}
              onPress={() => onToggleAmenity(amenity.id)}
              className={`flex-row items-center gap-2 px-4 py-3 rounded-full border-2 ${
                isSelected
                  ? "bg-black border-black"
                  : "bg-white border-gray-200"
              }`}
              activeOpacity={0.7}
            >
              <Ionicons
                name={amenity.icon}
                size={20}
                color={isSelected ? "white" : "#6E6B63"}
              />
              <Text
                className={`text-sm ${
                  isSelected ? "text-white" : "text-gray-500"
                }`}
              >
                {amenity.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}