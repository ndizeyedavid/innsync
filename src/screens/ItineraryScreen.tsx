import React, { useState, useEffect } from "react";
import ScreenLayout from "../layout/ScreenLayout";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import TabHeader from "../components/TabHeader";
import TimelineItem from "../components/ItineraryComponents/TimelineItem";
import ItineraryCard from "../components/ItineraryComponents/ItineraryCard";
import itineraryService from "../services/itinerary.service";
import reservationsService from "../services/reservations.service";
import { ItineraryItem, Reservation } from "../api/types";

export default function ItineraryScreen() {
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [currentReservation, setCurrentReservation] =
    useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  const handleDaySelection = (id: any) => {
    if (selectedDays.includes(id)) {
      setSelectedDays((prevSelectedDay) =>
        prevSelectedDay.filter((day) => day !== id),
      );
    } else {
      setSelectedDays((prevSelectedDay) => [...prevSelectedDay, id]);
    }
  };

  const availableDays = [
    // { id: 0, day: "Thur" },
    { id: 1, day: "Yesterday" },
    { id: 2, day: "Today" },
    { id: 3, day: "Tomorrow" },
    { id: 4, day: "Mon" },
    { id: 5, day: "Tue" },
    { id: 6, day: "wed" },
    { id: 7, day: "Thur" },
    { id: 8, day: "Rent Due" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get current reservation to get stayId
      const reservations = await reservationsService.listMine();
      const activeReservation =
        reservations.find((r) => r.status === "CHECKED_IN") || reservations[0];
      setCurrentReservation(activeReservation);

      if (activeReservation) {
        // Load itinerary items for this stay
        const items = await itineraryService.getForStay(activeReservation.id);
        setItineraryItems(items);
      }
    } catch (error) {
      console.error("Error loading itinerary:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert API itinerary items to component format
  const formattedItems = itineraryItems.map((item) => ({
    image: item.title.includes("yoga")
      ? require("../assets/images/yoga.jpg")
      : require("../assets/images/meal.png"),
    time: `${item.startTime.split("T")[1].substring(0, 5)} - ${item.endTime ? item.endTime.split("T")[1].substring(0, 5) : ""}`,
    isBooked: item.status === "CONFIRMED" || item.status === "COMPLETED",
    title: item.title,
    location: item.location || "Hotel",
    description: item.description || "",
    isIncluded: true,
    isConfirmed: item.status === "CONFIRMED",
  }));

  return (
    <ScreenLayout>
      <View className="flex-row justify-between items-center">
        <TabHeader
          alt={currentReservation?.hotelName || "RWANDA"}
          title="Your itinerary,"
          description={
            currentReservation
              ? `${new Date(currentReservation.checkInDate).toLocaleDateString()} - ${new Date(currentReservation.checkOutDate).toLocaleDateString()} · 2 adults`
              : "April 26 - April 30 · 2 adults"
          }
          descriptionStyle="text-[12px] text-[#9C988E]"
        />
        <View className="px-[11px] py-[5px] bg-[#D9D9D9] flex-row gap-1 items-center rounded-2xl">
          <View className="size-[6px] bg-[#3F6B4F] rounded-full" />
          <Text className="text-[13px] text-[#3F6B4F]">LIVE</Text>
        </View>
      </View>

      <View className="my-[17px]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-5 "
          contentContainerStyle={{ gap: 12 }}
        >
          {availableDays.map((day, index) => (
            <DayCard
              id={index}
              key={index}
              day={day.day}
              active={selectedDays.includes(day.id)}
              onPress={() => handleDaySelection(day.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View>
        {loading ? (
          <Text className="text-center text-[#9C988E] mt-10">
            Loading itinerary...
          </Text>
        ) : formattedItems.length > 0 ? (
          formattedItems.map((item, index) => (
            <TimelineItem key={index} startTime={item.time.split("-")[0]}>
              <ItineraryCard
                image={item.image}
                time={item.time}
                title={item.title}
                location={item.location}
                description={item.description}
                isIncluded={item.isIncluded}
                isBooked={item.isBooked}
                isConfirmed={item.isConfirmed}
              />
            </TimelineItem>
          ))
        ) : (
          <Text className="text-center text-[#9C988E] mt-10">
            No itinerary items for this stay
          </Text>
        )}
      </View>
    </ScreenLayout>
  );
}

interface IDayCard {
  day: string;
  id: number;
  active: boolean;
  onPress: any;
}

function DayCard({ id, day, active, onPress }: IDayCard) {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPress}
      className={`bg-${active ? "black" : "white"} border-[#E8E5DD] px-[20px] py-[17px] rounded-2xl`}
    >
      <Text className="text-[#B6B6B5] text-[15px]">{day}</Text>
      <Text
        className={`text-${active ? "white" : "black"} text-[24px] font-bold`}
      >
        Day {id + 1}
      </Text>
    </TouchableOpacity>
  );
}
