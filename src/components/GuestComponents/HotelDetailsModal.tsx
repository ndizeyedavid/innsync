import React, { useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";

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

interface HotelDetailsModalProps {
  visible: boolean;
  hotel: Hotel | null;
  onClose: () => void;
  onBookPress: () => void;
}

export default function HotelDetailsModal({
  visible,
  hotel,
  onClose,
  onBookPress,
}: HotelDetailsModalProps) {
  if (!hotel) return null;

  const scrollY = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: any) => {
    scrollY.setValue(event.nativeEvent.contentOffset.y);
  };

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [1.15, 1, 0.85],
    extrapolate: "clamp",
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [20, 0, -30],
    extrapolate: "clamp",
  });

  const imageAnimatedStyle = {
    transform: [{ scale: imageScale }, { translateY: imageTranslateY }],
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={32}
        >
          {/* Header with close button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hotel Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Hotel Image */}
          <View style={styles.imageContainer}>
            <Animated.Image
              source={hotel.image}
              style={[styles.hotelImage, imageAnimatedStyle]}
              resizeMode="cover"
              resizeMethod="scale"
            />
          </View>

          {/* Hotel Info */}
          <View style={styles.contentContainer}>
            {/* Name and Rating */}
            <View style={styles.titleRow}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{hotel.rating}</Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#6E6B63" />
              <Text style={styles.locationText}>{hotel.location}</Text>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>
                {hotel.description ||
                  `Experience luxury and comfort at ${hotel.name}. Our hotel offers exceptional service, modern amenities, and a prime location perfect for both business and leisure travelers.`}
              </Text>
            </View>

            {/* Amenities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {hotel.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#3F6B4F"
                    />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Pricing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pricing</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceAmount}>
                  ${hotel.price}
                  <Text style={styles.pricePeriod}>/night</Text>
                </Text>
                <Text style={styles.priceNote}>Plus taxes and fees</Text>
              </View>
            </View>

            {/* Meals */}
            {hotel.meals && hotel.meals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Meals & Dining</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mealsScrollContent}
                >
                  {hotel.meals.map((meal) => (
                    <View key={meal.id} style={styles.mealCard}>
                      <Image
                        source={meal.image}
                        style={styles.mealImage}
                        resizeMode="cover"
                      />
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealDescription}>
                          {meal.description}
                        </Text>
                        <Text style={styles.mealPrice}>${meal.price}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Book Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                onBookPress();
              }}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#fafaf7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 10,
    backgroundColor: "#fafaf7",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  scrollContent: {
    flex: 1,
    backgroundColor: "#fafaf7",
  },
  imageContainer: {
    paddingTop: Platform.OS === "ios" ? 120 : 100,
    overflow: "hidden",
  },
  hotelImage: {
    width: "100%",
    height: 350,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    marginRight: 10,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  locationText: {
    fontSize: 14,
    color: "#6E6B63",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#6E6B63",
    lineHeight: 22,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  amenityText: {
    fontSize: 14,
    color: "#333",
  },
  priceContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
  },
  pricePeriod: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6E6B63",
  },
  priceNote: {
    fontSize: 13,
    color: "#9C988E",
    marginTop: 4,
  },
  mealsScrollContent: {
    gap: 12,
    paddingHorizontal: 2,
  },
  mealCard: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
  },
  mealImage: {
    width: "100%",
    height: 120,
  },
  mealInfo: {
    padding: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 12,
    color: "#6E6B63",
    marginBottom: 8,
    lineHeight: 16,
  },
  mealPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    backgroundColor: "#fafaf7",
    marginTop: 20,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
