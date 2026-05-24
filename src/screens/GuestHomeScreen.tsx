import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import ScreenLayout from "../layout/ScreenLayout";
import HotelCard from "../components/GuestComponents/HotelCard";
import AmenitiesSection from "../components/GuestComponents/AmenitiesSection";
import HotelDetailsModal from "../components/GuestComponents/HotelDetailsModal";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: any;
  amenities: string[];
  description?: string;
}

// Mock hotel data
const hotels: Hotel[] = [
  {
    id: "1",
    name: "Sereno Bay Resort",
    location: "Malibu, California",
    rating: 4.8,
    price: 350,
    image: require("../assets/images/order-1.jpg"),
    amenities: ["Pool", "Spa", "Restaurant", "Gym", "Beach Access", "WiFi"],
    description:
      "Nestled along the pristine shores of Malibu, Sereno Bay Resort offers breathtaking ocean views and world-class amenities. Our infinity pool seems to merge with the Pacific, while our award-winning spa provides ultimate relaxation.",
  },
  {
    id: "2",
    name: "Mountain View Lodge",
    location: "Aspen, Colorado",
    rating: 4.9,
    price: 425,
    image: require("../assets/images/order-2.jpg"),
    amenities: ["Ski Access", "Spa", "Restaurant", "Fireplace", "WiFi"],
    description:
      "Experience the ultimate mountain getaway at Mountain View Lodge. With ski-in/ski-out access, cozy fireplaces in every room, and panoramic views of the Rockies, we're the perfect destination for winter adventures and summer escapes.",
  },
  {
    id: "3",
    name: "Urban Oasis Hotel",
    location: "New York City",
    rating: 4.7,
    price: 280,
    image: require("../assets/images/order-3.jpg"),
    amenities: ["Rooftop Bar", "Gym", "Restaurant", "WiFi", "Concierge"],
    description:
      "In the heart of Manhattan, Urban Oasis Hotel is your sanctuary in the city that never sleeps. Our rooftop bar offers stunning skyline views, while our concierge team ensures your NYC experience is unforgettable.",
  },
  {
    id: "4",
    name: "Coastal Paradise Inn",
    location: "Miami, Florida",
    rating: 4.6,
    price: 310,
    image: require("../assets/images/yoga.jpg"),
    amenities: ["Beach Access", "Pool", "Restaurant", "Spa", "WiFi"],
    description:
      "Step into paradise at Coastal Paradise Inn, where Miami's vibrant energy meets tropical tranquility. Our beachfront location, refreshing pool, and full-service spa create the perfect backdrop for your Florida vacation.",
  },
];

// Amenity filter options
const amenityOptions = [
  { id: "pool", name: "Pool", icon: "water" },
  { id: "spa", name: "Spa", icon: "sparkles" },
  { id: "gym", name: "Gym", icon: "fitness" },
  { id: "restaurant", name: "Restaurant", icon: "restaurant" },
  { id: "wifi", name: "WiFi", icon: "wifi" },
  { id: "beach", name: "Beach", icon: "umbrella" },
];

export default function GuestHomeScreen() {
  const router = useRouter();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>(hotels);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleToggleAmenity = (amenityId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelectedAmenities((prev) => {
      if (prev.includes(amenityId)) {
        return prev.filter((id) => id !== amenityId);
      } else {
        return [...prev, amenityId];
      }
    });
  };

  // Filter hotels based on selected amenities
  useEffect(() => {
    if (selectedAmenities.length === 0) {
      setFilteredHotels(hotels);
    } else {
      const filtered = hotels.filter((hotel) =>
        selectedAmenities.some((amenityId) => {
          const amenityMap: { [key: string]: string } = {
            pool: "Pool",
            spa: "Spa",
            gym: "Gym",
            restaurant: "Restaurant",
            wifi: "WiFi",
            beach: "Beach Access",
          };
          return hotel.amenities.includes(amenityMap[amenityId]);
        }),
      );
      setFilteredHotels(filtered);
    }
  }, [selectedAmenities]);

  const handleHotelPress = (hotelId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const hotel = hotels.find((h) => h.id === hotelId);
    if (hotel) {
      setSelectedHotel(hotel);
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(false);
    setSelectedHotel(null);
  };

  const handleBookPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setModalVisible(false);
    // Navigate to booking/onboarding flow
    router.push("/signup");
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-[12px] text-[#9C988E] uppercase">
              Discover
            </Text>
            <Text className="text-[24px] font-semibold">Find Your Stay</Text>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push("/login")}
              className="bg-black px-3 py-1 rounded-full"
            >
              <Text className="text-white font-semibold relative top-px">
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/signup")}
              className="bg-white px-3 py-1 rounded-full border-2 border-black"
            >
              <Text className="text-black font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="mt-4 flex-row items-center bg-white rounded-2xl px-4 py-3">
          <Ionicons name="search" size={20} color="#6E6B63" />
          <Text className="ml-3 text-[#6E6B63]">Search destinations...</Text>
        </View>
      </View>

      {/* Amenities Filter */}
      <AmenitiesSection
        amenities={amenityOptions}
        selectedAmenities={selectedAmenities}
        onToggleAmenity={handleToggleAmenity}
      />

      {/* Hotel Count */}
      <View className="flex-row justify-between items-center mt-4">
        <Text className="text-lg font-semibold">
          {filteredHotels.length}{" "}
          {filteredHotels.length === 1 ? "Hotel" : "Hotels"}
        </Text>

        {selectedAmenities.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedAmenities([]);
            }}
          >
            <Text className="text-[#6E6B63]">Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hotel Listings */}
      <ScrollView
        className="flex-1 mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {filteredHotels.length > 0 ? (
          filteredHotels.map((hotel, index) => (
            <View key={hotel.id}>
              <HotelCard
                id={hotel.id}
                name={hotel.name}
                location={hotel.location}
                rating={hotel.rating}
                price={hotel.price}
                image={hotel.image}
                amenities={hotel.amenities}
                onPress={() => handleHotelPress(hotel.id)}
              />
            </View>
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="search-outline" size={60} color="#9C988E" />
            <Text className="text-[#6E6B63] mt-4 text-lg">
              No hotels found with selected filters
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedAmenities([])}
              className="mt-4 bg-black px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Hotel Details Modal */}
      <HotelDetailsModal
        visible={modalVisible}
        hotel={selectedHotel}
        onClose={handleCloseModal}
        onBookPress={handleBookPress}
      />
      <StatusBar style="dark" />
    </ScreenLayout>
  );
}
