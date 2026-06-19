import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import MapView, { Marker } from "react-native-maps";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type MapOverlayType = "weather" | "pois" | "events" | "nearby" | null;

// Kigali coordinates
const KIGALI_REGION = {
  latitude: -1.9441,
  longitude: 30.0619,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Mock data for Kigali
const KIGALI_MARKERS = [
  {
    id: "1",
    latitude: -1.94,
    longitude: 30.06,
    title: "Kigali Convention Centre",
    type: "landmark",
  },
  {
    id: "2",
    latitude: -1.935,
    longitude: 30.065,
    title: "Nyamata Restaurant",
    type: "restaurant",
  },
  {
    id: "3",
    latitude: -1.95,
    longitude: 30.055,
    title: "Kigali Genocide Memorial",
    type: "landmark",
  },
  {
    id: "4",
    latitude: -1.942,
    longitude: 30.068,
    title: "Kigali Arena",
    type: "venue",
  },
];

interface WeatherData {
  temp: number;
  condition: string;
  feelsLike: number;
  wind: number;
  humidity: number;
  activitySuitability: string;
  icon: string;
}

const MOCK_WEATHER: WeatherData = {
  temp: 24,
  condition: "Partly Cloudy",
  feelsLike: 26,
  wind: 12,
  humidity: 65,
  activitySuitability: "Great for exploring Kigali!",
  icon: "partly-sunny-outline",
};

interface POI {
  id: string;
  name: string;
  category: string;
  distance: string;
  rating: number;
  price: string;
  description: string;
}

const MOCK_POIS: POI[] = [
  {
    id: "1",
    name: "Nyamata Restaurant",
    category: "Restaurant",
    distance: "0.5 km",
    rating: 4.8,
    price: "$$",
    description: "Authentic Rwandan cuisine with local dishes",
  },
  {
    id: "2",
    name: "Kigali Genocide Memorial",
    category: "Landmark",
    distance: "1.2 km",
    rating: 4.9,
    price: "Free",
    description: "Memorial to victims of the 1994 genocide",
  },
  {
    id: "3",
    name: "Kigali Convention Centre",
    category: "Landmark",
    distance: "0.8 km",
    rating: 4.7,
    price: "Free",
    description: "Iconic building with panoramic views",
  },
];

interface LiveEvent {
  id: string;
  name: string;
  time: string;
  location: string;
  attendees: number;
  price: string;
}

const MOCK_EVENTS: LiveEvent[] = [
  {
    id: "1",
    name: "Kigali Jazz Night",
    time: "Tonight 7:00 PM",
    location: "Kigali Arena",
    attendees: 234,
    price: "RWF 15,000",
  },
  {
    id: "2",
    name: "Rwanda Cultural Festival",
    time: "Tomorrow 10:00 AM",
    location: "Nyamata Cultural Village",
    attendees: 567,
    price: "RWF 5,000",
  },
  {
    id: "3",
    name: "Local Art Market",
    time: "Saturday 9:00 AM",
    location: "Kimironko Market",
    attendees: 890,
    price: "Free Entry",
  },
];

const MOCK_NEARBY = [
  {
    id: "1",
    name: "Hotel des Mille Collines",
    type: "Hotel",
    distance: "1.1 km",
    rating: 4.6,
  },
  {
    id: "2",
    name: "Kigali City Market",
    type: "Market",
    distance: "0.7 km",
    rating: 4.4,
  },
  {
    id: "3",
    name: "Rwanda Art Museum",
    type: "Museum",
    distance: "1.5 km",
    rating: 4.8,
  },
];

export default function MapScreen() {
  const router = useRouter();
  const [activeOverlay, setActiveOverlay] = useState<MapOverlayType>(null);

  const overlayButtons = [
    { id: "weather" as const, label: "Weather", icon: "cloudy-outline" },
    { id: "pois" as const, label: "Quick POI", icon: "pin-outline" },
    { id: "events" as const, label: "Live Events", icon: "calendar-outline" },
    { id: "nearby" as const, label: "Nearby", icon: "navigate-outline" },
  ];

  const handleOverlayPress = (overlay: MapOverlayType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveOverlay(activeOverlay === overlay ? null : overlay);
  };

  // Render weather panel
  const renderWeatherPanel = () => (
    <View style={styles.overlayPanel}>
      <Text style={styles.overlayPanelTitle}>Kigali Weather</Text>
      <View style={styles.weatherMain}>
        <View style={styles.weatherLeft}>
          <Text style={styles.weatherTemp}>{MOCK_WEATHER.temp}°C</Text>
          <Text style={styles.weatherCondition}>{MOCK_WEATHER.condition}</Text>
        </View>
        <View style={styles.weatherRight}>
          <Ionicons name={MOCK_WEATHER.icon} size={60} color="#4ab3de" />
        </View>
      </View>
      <View style={styles.weatherDetails}>
        <View style={styles.weatherDetailItem}>
          <Ionicons name="thermometer-outline" size={20} color="#9CA3AF" />
          <Text style={styles.weatherDetailText}>
            Feels like {MOCK_WEATHER.feelsLike}°
          </Text>
        </View>
        <View style={styles.weatherDetailItem}>
          <Ionicons name="leaf-outline" size={20} color="#9CA3AF" />
          <Text style={styles.weatherDetailText}>
            Wind {MOCK_WEATHER.wind} km/h
          </Text>
        </View>
        <View style={styles.weatherDetailItem}>
          <Ionicons name="water-outline" size={20} color="#9CA3AF" />
          <Text style={styles.weatherDetailText}>
            Humidity {MOCK_WEATHER.humidity}%
          </Text>
        </View>
      </View>
      <Text style={styles.weatherSuitability}>
        {MOCK_WEATHER.activitySuitability}
      </Text>
    </View>
  );

  // Render POIs panel
  const renderPOIsPanel = () => (
    <View style={styles.overlayPanel}>
      <Text style={styles.overlayPanelTitle}>Quick Points of Interest</Text>
      <ScrollView
        style={styles.panelScroll}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_POIS.map((poi) => (
          <View key={poi.id} style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>{poi.name}</Text>
              <Text style={styles.listItemDesc}>{poi.description}</Text>
              <View style={styles.listItemMeta}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={styles.metaText}>{poi.rating}</Text>
                <Ionicons
                  name="pricetag-outline"
                  size={14}
                  color="#9CA3AF"
                  style={{ marginLeft: 12 }}
                />
                <Text style={styles.metaText}>{poi.price}</Text>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#9CA3AF"
                  style={{ marginLeft: 12 }}
                />
                <Text style={styles.metaText}>{poi.distance}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Render events panel
  const renderEventsPanel = () => (
    <View style={styles.overlayPanel}>
      <Text style={styles.overlayPanelTitle}>Live Events in Kigali</Text>
      <ScrollView
        style={styles.panelScroll}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_EVENTS.map((event) => (
          <View key={event.id} style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>{event.name}</Text>
              <View style={styles.listItemMeta}>
                <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{event.time}</Text>
              </View>
              <View style={styles.listItemMeta}>
                <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{event.location}</Text>
              </View>
              <View style={styles.listItemMeta}>
                <Ionicons name="people-outline" size={14} color="#4ab3de" />
                <Text style={styles.metaTextPrimary}>
                  {event.attendees} attending
                </Text>
                <Ionicons
                  name="cash-outline"
                  size={14}
                  color="#9CA3AF"
                  style={{ marginLeft: 12 }}
                />
                <Text style={styles.metaText}>{event.price}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Render nearby panel
  const renderNearbyPanel = () => (
    <View style={styles.overlayPanel}>
      <Text style={styles.overlayPanelTitle}>Nearby Places</Text>
      <ScrollView
        style={styles.panelScroll}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_NEARBY.map((place) => (
          <View key={place.id} style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>{place.name}</Text>
              <View style={styles.listItemMeta}>
                <Text style={styles.metaTextPrimary}>{place.type}</Text>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#9CA3AF"
                  style={{ marginLeft: 12 }}
                />
                <Text style={styles.metaText}>{place.distance}</Text>
                <Ionicons
                  name="star"
                  size={14}
                  color="#fbbf24"
                  style={{ marginLeft: 12 }}
                />
                <Text style={styles.metaText}>{place.rating}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Full Screen Map - Kigali */}
      <MapView
        style={styles.map}
        initialRegion={KIGALI_REGION}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {KIGALI_MARKERS.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            pinColor="#4ab3de"
          />
        ))}
      </MapView>

      {/* Top Back Button */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={28} color="#283D5A" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Left Vertical Buttons */}
      <View style={styles.overlayButtons}>
        {overlayButtons.map((button) => (
          <TouchableOpacity
            key={button.id}
            style={[
              styles.overlayButton,
              activeOverlay === button.id && styles.activeOverlayButton,
            ]}
            onPress={() => handleOverlayPress(button.id)}
          >
            <Ionicons
              name={button.icon}
              size={24}
              color={activeOverlay === button.id ? "#fff" : "#283D5A"}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Overlay Panels */}
      {activeOverlay === "weather" && renderWeatherPanel()}
      {activeOverlay === "pois" && renderPOIsPanel()}
      {activeOverlay === "events" && renderEventsPanel()}
      {activeOverlay === "nearby" && renderNearbyPanel()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 50,
    height: 50,
    backgroundColor: "white",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
    left: 10,
  },
  overlayButtons: {
    position: "absolute",
    left: 20,
    bottom: 100,
    gap: 12,
  },
  overlayButton: {
    width: 56,
    height: 56,
    backgroundColor: "white",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activeOverlayButton: {
    backgroundColor: "#4ab3de",
  },
  overlayPanel: {
    position: "absolute",
    left: 88,
    bottom: 100,
    right: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  overlayPanelTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#283D5A",
    marginBottom: 16,
  },
  panelScroll: {
    maxHeight: SCREEN_HEIGHT * 0.3,
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  listItemContent: {
    gap: 6,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#283D5A",
  },
  listItemDesc: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  listItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  metaTextPrimary: {
    fontSize: 13,
    color: "#4ab3de",
    fontWeight: "500",
  },
  weatherMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  weatherLeft: {
    gap: 4,
  },
  weatherTemp: {
    fontSize: 40,
    fontWeight: "700",
    color: "#283D5A",
  },
  weatherCondition: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  weatherRight: {
    alignItems: "center",
  },
  weatherDetails: {
    flexDirection: "column",
    gap: 10,
    marginBottom: 16,
  },
  weatherDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  weatherDetailText: {
    fontSize: 14,
    color: "#6B7280",
  },
  weatherSuitability: {
    fontSize: 14,
    color: "#4ab3de",
    fontWeight: "500",
  },
});
