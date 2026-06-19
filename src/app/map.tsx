import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import MapView, { Marker } from "react-native-maps";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type MapOverlayType = "weather" | "pois" | "events" | "nearby" | null;

export default function MapScreen() {
  const router = useRouter();
  const [activeOverlay, setActiveOverlay] = useState<MapOverlayType>(null);

  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const mockMarkers = [
    {
      id: "1",
      latitude: 37.78925,
      longitude: -122.4314,
      title: "Blue Ocean Restaurant",
    },
    {
      id: "2",
      latitude: 37.78725,
      longitude: -122.4344,
      title: "Sunset Music Festival",
    },
    {
      id: "3",
      latitude: 37.79025,
      longitude: -122.4294,
      title: "Mountain View Park",
    },
  ];

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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Full Screen Map */}
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {mockMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
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

      {/* Active Overlay Panel (optional) */}
      {activeOverlay && (
        <View style={styles.overlayPanel}>
          <Text style={styles.overlayPanelTitle}>
            {activeOverlay.charAt(0).toUpperCase() + activeOverlay.slice(1)}
          </Text>
          <Text style={styles.overlayPanelText}>
            {activeOverlay} panel content goes here
          </Text>
        </View>
      )}
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
  },
  overlayPanelTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#283D5A",
    marginBottom: 8,
  },
  overlayPanelText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
