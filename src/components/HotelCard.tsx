import { Text, TouchableOpacity, View, Image } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { Hotel } from "../api/types";

interface IHotelCard {
  hotel: Hotel;
  onPress: () => void;
  selected?: boolean;
}

export default function HotelCard({
  hotel,
  onPress,
  selected = false,
}: IHotelCard) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={`bg-white rounded-2xl overflow-hidden mb-4 border-2 ${
        selected ? "border-[#283D5A]" : "border-transparent"
      }`}
      onPress={onPress}
    >
      {/* Hotel Image */}
      <Image
        source={
          hotel.imageUrl
            ? { uri: hotel.imageUrl }
            : require("../assets/images/order-1.jpg")
        }
        className="w-full h-48"
        resizeMode="cover"
      />

      {/* Hotel Info */}
      <View className="p-4">
        {/* Name and Rating */}
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-xl font-semibold text-[#283D5A] flex-1">
            {hotel.name}
          </Text>
          {hotel.rating && (
            <View className="flex-row items-center gap-1 bg-[#F5F4EF] px-2 py-1 rounded-full">
              <Ionicons name="star" size={14} color="#283D5A" />
              <Text className="text-sm font-medium text-[#283D5A]">
                {hotel.rating}
              </Text>
            </View>
          )}
        </View>

        {/* Address */}
        <View className="flex-row items-center gap-1 mb-2">
          <Ionicons name="location-outline" size={14} color="#9C988E" />
          <Text className="text-sm text-[#9C988E] flex-1">
            {hotel.address}
          </Text>
        </View>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-2">
            {hotel.amenities.slice(0, 3).map((amenity, index) => (
              <View
                key={index}
                className="px-2 py-1 bg-[#F5F4EF] rounded-full"
              >
                <Text className="text-xs text-[#9C988E]">{amenity}</Text>
              </View>
            ))}
            {hotel.amenities.length > 3 && (
              <Text className="text-xs text-[#9C988E]">
                +{hotel.amenities.length - 3} more
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
