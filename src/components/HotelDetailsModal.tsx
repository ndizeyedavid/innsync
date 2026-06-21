import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { useState, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Hotel } from "../api/types";

const { width: screenWidth } = Dimensions.get("window");

interface HotelDetailsModalProps {
  visible: boolean;
  hotel: Hotel | null;
  onClose: () => void;
  onConfirm: (hotel: Hotel) => void;
}

export default function HotelDetailsModal({
  visible,
  hotel,
  onClose,
  onConfirm,
}: HotelDetailsModalProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showHotelNameInHeader, setShowHotelNameInHeader] = useState(false);
  const headerHeight = 60;
  const scrollThreshold = 200; // Adjust this to when the hotel name scrolls off screen

  if (!hotel) return null;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      listener: (event) => {
        // @ts-ignore
        const y = event.nativeEvent.contentOffset.y;
        setShowHotelNameInHeader(y > scrollThreshold);
      },
      useNativeDriver: false,
    },
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white mt-10">
        {/* Header */}
        <View
          className="flex-row items-center justify-between p-4 border-b border-gray-100"
          style={{ height: headerHeight }}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
          >
            <Ionicons name="close" size={28} color="#283D5A" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-navy">
            {showHotelNameInHeader ? hotel.name : "Hotel Details"}
          </Text>
          <View className="w-7" /> {/* Spacer for alignment */}
        </View>

        <Animated.ScrollView
          className="flex-1"
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Images */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="w-full h-64"
          >
            {hotel.imageUrl ? (
              <Image
                source={{ uri: hotel.imageUrl }}
                style={{ width: screenWidth, height: 256 }}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("../assets/images/order-1.jpg")}
                style={{ width: screenWidth, height: 256 }}
                resizeMode="cover"
              />
            )}
            {/* Add more mock images if needed */}
          </ScrollView>

          {/* Hotel Info */}
          <View className="p-4">
            <Text className="text-2xl font-semibold text-navy mb-2">
              {hotel.name}
            </Text>
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="location-outline" size={16} color="#9C988E" />
              <Text className="text-sm text-[#9C988E] flex-1">
                {hotel.address}
              </Text>
            </View>

            {/* Rating */}
            {hotel.rating && (
              <View className="flex-row items-center gap-1 mb-4">
                <View className="px-2 py-1 bg-[#F5F4EF] rounded-full flex-row items-center gap-1">
                  <Ionicons name="star" size={14} color="#d08700" />
                  <Text className="text-sm font-medium text-navy">
                    {hotel.rating}
                  </Text>
                </View>
              </View>
            )}

            {/* Description */}
            {hotel.description && (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-[#9C988E] mb-2 uppercase">
                  About
                </Text>
                <Text className="text-base leading-relaxed text-gray-700">
                  {hotel.description}
                </Text>
              </View>
            )}

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-[#9C988E] mb-3 uppercase">
                  Amenities
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {hotel.amenities.map((amenity, index) => (
                    <View
                      key={index}
                      className="bg-[#F5F4EF] px-3 py-2 rounded-full"
                    >
                      <Text className="text-sm text-gray-700">{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Location Map */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-[#9C988E] mb-3 uppercase">
                Location
              </Text>
              <View className="w-full h-48 rounded-2xl overflow-hidden">
                {hotel.latitude && hotel.longitude ? (
                  <MapView
                    style={{ width: "100%", height: "100%" }}
                    initialRegion={{
                      latitude: hotel.latitude,
                      longitude: hotel.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: hotel.latitude,
                        longitude: hotel.longitude,
                      }}
                      title={hotel.name}
                      description={hotel.address}
                    />
                  </MapView>
                ) : (
                  <View className="w-full h-full bg-[#F5F4EF] items-center justify-center">
                    <Ionicons name="map-outline" size={40} color="#9C988E" />
                    <Text className="text-sm text-[#9C988E] mt-2">
                      Map unavailable
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Available Rooms */}
            {hotel.availableRooms !== undefined && (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-[#9C988E] mb-2 uppercase">
                  Availability
                </Text>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="bed-outline" size={16} color="#10B981" />
                  <Text className="text-base text-gray-700">
                    {hotel.availableRooms} rooms available
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animated.ScrollView>

        {/* Confirm Button */}
        <View className="p-4 border-t border-gray-100 bg-white">
          <TouchableOpacity
            activeOpacity={0.7}
            className="w-full h-14 bg-[#283D5A] rounded-2xl flex-row items-center justify-center gap-2"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onConfirm(hotel);
            }}
          >
            <Text className="text-white text-base font-semibold">
              Confirm Selection
            </Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
