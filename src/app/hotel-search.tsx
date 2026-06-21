import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import ScreenLayout from "../layout/ScreenLayout";
import HotelCard from "../components/HotelCard";
import HotelDetailsModal from "../components/HotelDetailsModal";
import ContextualLoadingComponent from "../components/ContextualLoadingComponent";
import hotelsService from "../services/hotels.service";
import { Hotel } from "../api/types";
import { useToast } from "../contexts/ToastContext";

export default function HotelSearchScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      // Try API first, fallback to mock data
      try {
        const data = await hotelsService.getHotels();
        setHotels(data);
      } catch {
        // Fallback to mock data
        const mockHotels = hotelsService.getMockHotels();
        setHotels(mockHotels);
      }
    } catch (error) {
      console.error("Error loading hotels:", error);
      showToast("error", "Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectHotel = (hotel: Hotel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedHotel(hotel);
    setIsModalVisible(true);
  };

  const handleConfirmHotel = (hotel: Hotel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsModalVisible(false);
    // Pass selected hotel to onboarding
    router.push({
      pathname: "/onboarding",
      params: { hotelId: hotel.id, hotelName: hotel.name },
    });
  };

  if (loading) {
    return <ContextualLoadingComponent text="Loading hotels..." />;
  }

  return (
    <ScreenLayout>
      {/* Header */}
      <View className="flex-row items-center gap-4 mb-6">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-sand-100 items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#283D5A" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-semibold text-navy">Select Hotel</Text>
          <Text className="text-gray-500 text-sm">
            Choose your hotel to continue booking
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View className="relative justify-center mb-6">
        <Ionicons
          name="search-outline"
          size={20}
          color="#9C988E"
          className="absolute z-10 left-4"
        />
        <TextInput
          className="rounded-2xl border border-gray-200 bg-white py-4 px-12"
          placeholder="Search hotels, cities..."
          placeholderTextColor="#9C988E"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Hotels List */}
      <ScrollView className="flex-1 mb-24">
        {filteredHotels.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Ionicons name="search" size={48} color="#E8E5DD" />
            <Text className="text-gray-500 text-center mt-4">
              No hotels found
            </Text>
          </View>
        ) : (
          filteredHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              selected={false}
              onPress={() => handleSelectHotel(hotel)}
            />
          ))
        )}
      </ScrollView>

      {/* Hotel Details Modal */}
      <HotelDetailsModal
        visible={isModalVisible}
        hotel={selectedHotel}
        onClose={() => setIsModalVisible(false)}
        onConfirm={handleConfirmHotel}
      />
    </ScreenLayout>
  );
}
