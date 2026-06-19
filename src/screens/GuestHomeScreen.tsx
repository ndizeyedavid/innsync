import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import ScreenLayout from "../layout/ScreenLayout";
import HotelCard from "../components/GuestComponents/HotelCard";
import AmenitiesSection from "../components/GuestComponents/AmenitiesSection";
import HotelDetailsModal from "../components/GuestComponents/HotelDetailsModal";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../hooks/useAuth";
import authService from "../services/auth.service";
import { User } from "../api/types";
import { useToast } from "../contexts/ToastContext";

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: any;
  amenities: string[];
  description?: string;
  meals?: {
    id: string;
    name: string;
    description: string;
    image: any;
    price: number;
  }[];
}

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
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
      // TODO: Load hotels from API once endpoint is available
      setHotels([]);
      setFilteredHotels([]);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

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
  }, [selectedAmenities, hotels]);

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

  if (loading) {
    return (
      <ScreenLayout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#283D5A" />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      {/* Header */}
      <View>
        <View className="flex-row justify-between items-center">
          {/* Show Discover/Find Your Stay only if not authenticated */}
          {!isAuthenticated && (
            <View>
              <Text className="text-[12px] text-gray-500 uppercase">
                Discover
              </Text>
              <Text className="text-[24px] font-semibold text-navy">
                Find Your Stay
              </Text>
            </View>
          )}

          {/* Search Bar (only if authenticated) */}
          {isAuthenticated && (
            <View className="flex-1 flex-row items-center bg-white rounded-2xl px-4 py-3 mr-4">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <Text className="ml-3 text-gray-500">Search destinations...</Text>
            </View>
          )}

          {/* Right side buttons */}
          <View className="flex-row gap-3 items-center">
            {!isAuthenticated ? (
              <>
                <TouchableOpacity
                  onPress={() => router.push("/login")}
                  className="bg-cobalt px-3 py-1 rounded-full"
                >
                  <Text className="text-white font-semibold relative top-px">
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/signup")}
                  className="bg-white px-3 py-1 rounded-full border-2 border-cobalt"
                >
                  <Text className="text-navy font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Notification Bell */}
                {/* <TouchableOpacity className="size-[47px] bg-sand-100 rounded-full items-center justify-center relative">
                  <Ionicons
                    name="notifications-outline"
                    color="#283D5A"
                    size={24}
                  />
                  <View className="size-[8px] bg-error rounded-full absolute top-2 right-3" />
                </TouchableOpacity> */}

                {/* Profile Avatar */}
                <TouchableOpacity
                  className="size-[47px] bg-sand-100 rounded-full items-center justify-center"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/profile");
                  }}
                >
                  <Ionicons name="person-outline" color="#283D5A" size={24} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Search Bar (only if not authenticated) */}
        {!isAuthenticated && (
          <View className="mt-4 flex-row items-center bg-white rounded-2xl px-4 py-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <Text className="ml-3 text-gray-500">Search destinations...</Text>
          </View>
        )}
      </View>

      {/* Amenities Filter */}
      <AmenitiesSection
        amenities={amenityOptions}
        selectedAmenities={selectedAmenities}
        onToggleAmenity={handleToggleAmenity}
      />

      {/* Hotel Count */}
      <View className="flex-row justify-between items-center mt-4">
        <Text className="text-lg font-semibold text-navy">
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
            <Text className="text-gray-500">Clear Filters</Text>
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
            <Ionicons name="search-outline" size={60} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-lg">
              No hotels found with selected filters
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedAmenities([])}
              className="mt-4 bg-cobalt px-6 py-3 rounded-full"
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
