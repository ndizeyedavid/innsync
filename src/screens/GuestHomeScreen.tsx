import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
import hotelsService from "../services/hotels.service";
import { Hotel, User } from "../api/types";
import { useToast } from "../contexts/ToastContext";

const amenityOptions = [
  { id: "pool", name: "Pool", icon: "water" },
  { id: "spa", name: "Spa", icon: "sparkles" },
  { id: "gym", name: "Gym", icon: "fitness" },
  { id: "restaurant", name: "Restaurant", icon: "restaurant" },
  { id: "wifi", name: "WiFi", icon: "wifi" },
  { id: "beach", name: "Beach", icon: "umbrella" },
];

const amenityKeywordMap: Record<string, string[]> = {
  pool: ["pool", "swimming", "swim"],
  spa: ["spa", "wellness", "massage"],
  gym: ["gym", "fitness", "workout"],
  restaurant: ["restaurant", "dining", "bar", "restaurant"],
  wifi: ["wifi", "internet", "wi-fi"],
  beach: ["beach", "beach access", "ocean", "waterfront"],
};

function hotelMatchesAmenities(hotel: Hotel, selectedIds: string[]): boolean {
  if (selectedIds.length === 0) return true;
  const hotelAmenities = (hotel.amenities || []).map((a) => a.toLowerCase());
  return selectedIds.some((id) => {
    const keywords = amenityKeywordMap[id] || [id];
    return keywords.some((kw) => hotelAmenities.some((ha) => ha.includes(kw)));
  });
}

export default function GuestHomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      const hotelsData = await hotelsService.getHotels();
      setHotels(Array.isArray(hotelsData) ? hotelsData : []);
    } catch (error) {
      console.error("Error loading hotels:", error);
      setHotels([]);
      showToast("error", "Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const hotelsData = await hotelsService.getHotels();
      setHotels(Array.isArray(hotelsData) ? hotelsData : []);
    } catch {
      setHotels([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleToggleAmenity = (amenityId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId],
    );
  };

  const filteredHotels = React.useMemo(() => {
    let result = hotels;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.city && h.city.toLowerCase().includes(q)) ||
          (h.address && h.address.toLowerCase().includes(q)),
      );
    }

    if (selectedAmenities.length > 0) {
      result = result.filter((h) => hotelMatchesAmenities(h, selectedAmenities));
    }

    return result;
  }, [hotels, searchQuery, selectedAmenities]);

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
    <ScreenLayout refreshing={refreshing} onRefresh={onRefresh}>
      <View>
        <View className="flex-row justify-between items-center">
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

          {isAuthenticated && (
            <View className="flex-1 flex-row items-center bg-white rounded-2xl px-4 py-3 mr-4">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                className="ml-3 flex-1 text-gray-500"
                placeholder="Search destinations..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          )}

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
              <TouchableOpacity
                className="size-[47px] bg-sand-100 rounded-full items-center justify-center"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/profile");
                }}
              >
                <Ionicons name="person-outline" color="#283D5A" size={24} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!isAuthenticated && (
          <View className="mt-4 flex-row items-center bg-white rounded-2xl px-4 py-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="ml-3 flex-1 text-gray-500"
              placeholder="Search destinations..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <AmenitiesSection
        amenities={amenityOptions}
        selectedAmenities={selectedAmenities}
        onToggleAmenity={handleToggleAmenity}
      />

      <View className="flex-row justify-between items-center mt-4">
        <Text className="text-lg font-semibold text-navy">
          {filteredHotels.length}{" "}
          {filteredHotels.length === 1 ? "Hotel" : "Hotels"}
        </Text>
        {(selectedAmenities.length > 0 || searchQuery.length > 0) && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedAmenities([]);
              setSearchQuery("");
            }}
          >
            <Text className="text-gray-500">Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="mt-4">
        {filteredHotels.length > 0 ? (
          filteredHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              id={hotel.id}
              name={hotel.name}
              location={hotel.city || hotel.address || "Unknown"}
              rating={hotel.rating || 0}
              price={0}
              image={
                hotel.imageUrl
                  ? { uri: hotel.imageUrl }
                  : require("../assets/images/order-1.jpg")
              }
              amenities={hotel.amenities || []}
              availableRooms={hotel.availableRooms}
              onPress={() => handleHotelPress(hotel.id)}
            />
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="search-outline" size={60} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-lg text-center">
              {searchQuery || selectedAmenities.length > 0
                ? "No hotels match your filters"
                : "No hotels available"}
            </Text>
            {(selectedAmenities.length > 0 || searchQuery.length > 0) && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedAmenities([]);
                  setSearchQuery("");
                }}
                className="mt-4 bg-cobalt px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <HotelDetailsModal
        visible={modalVisible}
        hotel={
          selectedHotel
            ? {
                id: selectedHotel.id,
                name: selectedHotel.name,
                location:
                  selectedHotel.city ||
                  selectedHotel.address ||
                  "Unknown",
                rating: selectedHotel.rating || 0,
                price: 0,
                image: selectedHotel.imageUrl
                  ? { uri: selectedHotel.imageUrl }
                  : require("../assets/images/order-1.jpg"),
                amenities: selectedHotel.amenities || [],
                description: selectedHotel.description,
              }
            : null
        }
        onClose={handleCloseModal}
        onBookPress={handleBookPress}
      />
      <StatusBar style="dark" />
    </ScreenLayout>
  );
}
