import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import TabHeader from "../../components/TabHeader";
import ScreenLayout from "../../layout/ScreenLayout";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type POICategory = "all" | "food" | "attractions" | "events" | "shopping";

interface POI {
  id: string;
  name: string;
  category: POICategory;
  distance: string;
  rating: number;
  price: string;
  description: string;
  lat: number;
  lng: number;
}

interface LiveEvent {
  id: string;
  name: string;
  time: string;
  location: string;
  attendees: number;
  image: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  feelsLike: number;
  wind: number;
  humidity: number;
  activitySuitability: string;
}

export default function MapScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<POICategory>("all");
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  const categories: { key: POICategory; label: string; icon: string }[] = [
    { key: "all", label: "All", icon: "grid-outline" },
    { key: "food", label: "Food", icon: "restaurant-outline" },
    { key: "attractions", label: "Attractions", icon: "camera-outline" },
    { key: "events", label: "Events", icon: "calendar-outline" },
    { key: "shopping", label: "Shopping", icon: "bag-outline" },
  ];

  const pois: POI[] = [
    {
      id: "1",
      name: "Blue Ocean Restaurant",
      category: "food",
      distance: "0.5 km",
      rating: 4.8,
      price: "$$",
      description: "Fresh seafood with ocean views",
      lat: 0,
      lng: 0,
    },
    {
      id: "2",
      name: "Old Town Market",
      category: "shopping",
      distance: "0.8 km",
      rating: 4.6,
      price: "$",
      description: "Local crafts and souvenirs",
      lat: 0,
      lng: 0,
    },
    {
      id: "3",
      name: "Mountain View Park",
      category: "attractions",
      distance: "1.2 km",
      rating: 4.9,
      price: "Free",
      description: "Hiking trails and panoramic views",
      lat: 0,
      lng: 0,
    },
  ];

  const liveEvents: LiveEvent[] = [
    {
      id: "1",
      name: "Sunset Music Festival",
      time: "Today 6:00 PM",
      location: "Beach Plaza",
      attendees: 234,
      image:
        "https://coresg-normal.trae.ai/api/v1/text_to_image?prompt=sunset%20music%20festival%20beach&image_size=square",
    },
    {
      id: "2",
      name: "Local Art Market",
      time: "Tomorrow 10:00 AM",
      location: "Main Street",
      attendees: 156,
      image:
        "https://coresg-normal.trae.ai/api/v1/text_to_image?prompt=local%20art%20market%20outdoor&image_size=square",
    },
  ];

  const weather: WeatherData = {
    temp: 24,
    condition: "Partly Cloudy",
    feelsLike: 26,
    wind: 12,
    humidity: 65,
    activitySuitability: "Great for outdoor activities!",
  };

  return (
    <ScreenLayout>
      <View className="flex-row justify-between items-center mb-4">
        <TabHeader alt="DISCOVER" title="Explore" />
        <TouchableOpacity
          className="size-[47px] bg-sand-100 rounded-full items-center justify-center"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/profile");
          }}
        >
          <Ionicons name="person-outline" color="#283D5A" size={24} />
        </TouchableOpacity>
      </View>

      {/* Map placeholder */}
      <View
        style={styles.mapPlaceholder}
        className="bg-slate-100 rounded-3xl overflow-hidden mb-4"
      >
        <View className="flex-1 items-center justify-center">
          <Ionicons name="map-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-500 mt-2">Map view coming soon</Text>
        </View>
        {/* Weather widget */}
        <View className="absolute top-4 left-4 right-4 bg-white/95 rounded-2xl p-4 shadow-lg">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold">{weather.temp}°C</Text>
              <Text className="text-gray-600">{weather.condition}</Text>
            </View>
            <View className="items-center">
              <Ionicons name="cloudy-outline" size={40} color="#4ab3de" />
            </View>
          </View>
          <View className="flex-row gap-6 mt-3">
            <View className="items-center">
              <Ionicons name="thermometer-outline" size={16} color="#9CA3AF" />
              <Text className="text-xs text-gray-500">
                {weather.feelsLike}°
              </Text>
            </View>
            <View className="items-center">
              <Ionicons name="wind-outline" size={16} color="#9CA3AF" />
              <Text className="text-xs text-gray-500">{weather.wind} km/h</Text>
            </View>
            <View className="items-center">
              <Ionicons name="water-outline" size={16} color="#9CA3AF" />
              <Text className="text-xs text-gray-500">{weather.humidity}%</Text>
            </View>
          </View>
          <Text className="text-sm text-sky-600 mt-2">
            {weather.activitySuitability}
          </Text>
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-row gap-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveCategory(category.key);
              }}
              className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${
                activeCategory === category.key
                  ? "bg-sky text-white"
                  : "bg-white border border-[#E8ECEF]"
              }`}
            >
              <Ionicons
                name={category.icon}
                size={18}
                color={activeCategory === category.key ? "white" : "#9CA3AF"}
              />
              <Text
                className={
                  activeCategory === category.key
                    ? "text-white"
                    : "text-gray-600"
                }
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Live events */}
      <View className="mb-4">
        <Text className="text-xl font-bold mb-3">Live Events</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {liveEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                className="w-64 bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E8ECEF]"
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
              >
                <View className="h-32 bg-slate-200" />
                <View className="p-4">
                  <Text className="font-bold text-lg">{event.name}</Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text className="text-sm text-gray-500">{event.time}</Text>
                  </View>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#9CA3AF"
                    />
                    <Text className="text-sm text-gray-500">
                      {event.location}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2 mt-2">
                    <Ionicons name="people-outline" size={14} color="#4ab3de" />
                    <Text className="text-sm text-sky-600">
                      {event.attendees} attending
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Points of Interest */}
      <View>
        <Text className="text-xl font-bold mb-3">Nearby</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="gap-3">
            {pois.map((poi) => (
              <TouchableOpacity
                key={poi.id}
                className="bg-white rounded-2xl p-4 border border-[#E8ECEF] flex-row gap-3"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedPOI(poi);
                }}
              >
                <View className="w-16 h-16 bg-slate-200 rounded-xl items-center justify-center">
                  <Ionicons
                    name={
                      poi.category === "food"
                        ? "restaurant-outline"
                        : poi.category === "shopping"
                          ? "bag-outline"
                          : "camera-outline"
                    }
                    size={28}
                    color="#4ab3de"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-lg">{poi.name}</Text>
                  <Text className="text-sm text-gray-500">
                    {poi.description}
                  </Text>
                  <View className="flex-row items-center gap-4 mt-2">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="star" size={14} color="#fbbf24" />
                      <Text className="text-sm">{poi.rating}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons
                        name="pricetag-outline"
                        size={14}
                        color="#9CA3AF"
                      />
                      <Text className="text-sm text-gray-500">{poi.price}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#9CA3AF"
                      />
                      <Text className="text-sm text-gray-500">
                        {poi.distance}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="justify-center">
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  mapPlaceholder: {
    height: 300,
  },
});
