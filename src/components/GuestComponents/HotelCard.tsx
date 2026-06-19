import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";

interface HotelCardProps {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: any;
  amenities: string[];
  onPress: () => void;
}

export default function HotelCard({
  name,
  location,
  rating,
  price,
  image,
  amenities,
  onPress,
}: HotelCardProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className="rounded-2xl overflow-hidden bg-white mb-4"
      activeOpacity={0.9}
    >
      {/* Image */}
      <View className="relative">
        <Image
          source={image}
          style={{
            height: 200,
            width: "100%",
          }}
          className="bg-gray-300"
        />

        {/* Rating Badge */}
        <View className="absolute top-3 right-3 bg-navy/80 px-3 py-1 rounded-full flex-row items-center gap-1">
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text className="text-white text-sm font-semibold">{rating}</Text>
        </View>

        {/* Price Badge */}
        <View className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded-full">
          <Text className="text-black font-semibold text-lg">
            ${price}
            <Text className="text-sm text-gray-500">/night</Text>
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text className="text-2xl font-semibold">{name}</Text>

        <View className="flex-row items-center gap-1 mt-2">
          <Ionicons name="location" size={16} color="#9CA3AF" />
          <Text className="text-gray-500 text-sm">{location}</Text>
        </View>

        {/* Amenities Preview */}
        <View className="flex-row flex-wrap gap-2 mt-3">
          {amenities.slice(0, 4).map((amenity, index) => (
            <View key={index} className="bg-sand-100 px-3 py-1 rounded-full">
              <Text className="text-xs text-gray-500">{amenity}</Text>
            </View>
          ))}
          {amenities.length > 4 && (
            <View className="bg-sand-100 px-3 py-1 rounded-full">
              <Text className="text-xs text-gray-500">
                +{amenities.length - 4}
              </Text>
            </View>
          )}
        </View>

        {/* View Details Button */}
        <View className="mt-4 bg-cobalt py-3 rounded-xl items-center">
          <Text className="text-white font-semibold">View Details</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
