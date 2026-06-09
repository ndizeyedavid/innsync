import React, { useState, useEffect, useMemo, useRef } from "react";
import ScreenLayout from "../layout/ScreenLayout";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import TabHeader from "../components/TabHeader";
import TimelineItem from "../components/ItineraryComponents/TimelineItem";
import ItineraryCard from "../components/ItineraryComponents/ItineraryCard";
import itineraryService from "../services/itinerary.service";
import reservationsService from "../services/reservations.service";
import { ItineraryItem, GuestStay } from "../api/types";
import { useToast } from "../contexts/ToastContext";

// Helper to generate days between checkIn and checkOut
const generateStayDays = (checkIn: string, checkOut: string) => {
  const days = [];
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = new Date(start);
  let dayNumber = 1;

  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    const dateCopy = new Date(current);
    dateCopy.setHours(0, 0, 0, 0);

    // Determine day status
    let status: "past" | "today" | "future" = "future";
    if (dateCopy < today) {
      status = "past";
    } else if (dateCopy.getTime() === today.getTime()) {
      status = "today";
    }

    // Format day label
    const dayLabel =
      status === "today"
        ? "Today"
        : current.toLocaleDateString("en-US", { weekday: "short" });

    days.push({
      id: dayNumber - 1,
      dayNumber,
      date: dateStr,
      dayLabel,
      status,
    });

    current.setDate(current.getDate() + 1);
    dayNumber++;
  }

  return days;
};

// Helper to check if itinerary item is on a specific day
const isItemOnDay = (item: ItineraryItem, dayDate: string) => {
  const itemDate = item.startTime.split("T")[0];
  return itemDate === dayDate;
};

export default function ItineraryScreen() {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [currentStay, setCurrentStay] = useState<GuestStay | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const scrollViewRef = useRef<ScrollView>(null);
  const dayCardWidth = 100; // Approximate width of each day card + gap

  // Generate stay days when currentStay changes
  const stayDays = useMemo(() => {
    if (!currentStay) return [];
    return generateStayDays(currentStay.checkIn, currentStay.checkOut);
  }, [currentStay]);

  // Set default selected day to today when stayDays loads and auto-scroll
  useEffect(() => {
    if (stayDays.length > 0) {
      const todayIndex = stayDays.findIndex((d) => d.status === "today");
      const targetIndex = todayIndex !== -1 ? todayIndex : 0;
      setSelectedDayIndex(targetIndex);

      // Auto-scroll to today after a short delay
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: targetIndex * dayCardWidth - 20, // -20 for left padding
          animated: true,
        });
      }, 200);
    }
  }, [stayDays, dayCardWidth]);

  const handleDaySelection = (index: number) => {
    setSelectedDayIndex(index);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get current stay to get stayId
      const stays = await reservationsService.listMine();
      const activeStay =
        stays.find((s) => s.status === "CHECKED_IN") || stays[0];
      setCurrentStay(activeStay);

      if (activeStay) {
        // Load itinerary items for this stay
        const items = await itineraryService.getForStay(activeStay.id);
        setItineraryItems(Array.isArray(items) ? items : []);
      } else {
        setItineraryItems([]);
      }
    } catch (error) {
      console.error("Error loading itinerary:", error);
      setItineraryItems([]);
      showToast("error", "Failed to load itinerary");
    } finally {
      setLoading(false);
    }
  };

  // Filter itinerary items for selected day
  const selectedDay = stayDays[selectedDayIndex];
  const filteredItems = useMemo(() => {
    if (!selectedDay || !Array.isArray(itineraryItems)) return [];
    return itineraryItems.filter((item) => isItemOnDay(item, selectedDay.date));
  }, [itineraryItems, selectedDay]);

  // Convert API itinerary items to component format
  const formattedItems = filteredItems.map((item) => ({
    image: item.title.toLowerCase().includes("yoga")
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

  // Map stay properties to what screen expects
  const stayDisplay = {
    hotelName: "Hotel", // TODO: Get from hotel data when available
    checkInDate: currentStay?.checkIn,
    checkOutDate: currentStay?.checkOut,
    adults: currentStay?.adults || 2,
  };

  return (
    <ScreenLayout>
      <View className="flex-row justify-between items-center">
        <TabHeader
          alt={stayDisplay.hotelName}
          title="Your itinerary,"
          description={
            stayDisplay.checkInDate && stayDisplay.checkOutDate
              ? `${new Date(stayDisplay.checkInDate).toLocaleDateString()} - ${new Date(stayDisplay.checkOutDate).toLocaleDateString()} · ${stayDisplay.adults} adults`
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
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-5 "
          contentContainerStyle={{ gap: 12 }}
        >
          {stayDays.map((day) => (
            <DayCard
              key={day.id}
              id={day.id}
              day={day.dayLabel}
              dayNumber={day.dayNumber}
              status={day.status}
              active={selectedDayIndex === day.id}
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
            No itinerary items for this day
          </Text>
        )}
      </View>
    </ScreenLayout>
  );
}

interface IDayCard {
  day: string;
  id: number;
  dayNumber: number;
  status: "past" | "today" | "future";
  active: boolean;
  onPress: any;
}

function DayCard({ id, day, dayNumber, status, active, onPress }: IDayCard) {
  // Determine styles based on status and active
  let bgClass = "bg-white";
  let textClass = "text-black";
  let opacityClass = "";
  let borderClass = "border-[#E8E5DD]";

  if (status === "past") {
    opacityClass = "opacity-50";
  }

  if (status === "today" && !active) {
    bgClass = "bg-[#3F6B4F]"; // Same green as LIVE indicator
    textClass = "text-white";
    borderClass = "border-[#3F6B4F]";
  }

  if (active) {
    bgClass = "bg-black";
    textClass = "text-white";
    opacityClass = "";
    borderClass = "border-black";
  }

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPress}
      className={`${bgClass} ${opacityClass} border ${borderClass} px-[20px] py-[17px] rounded-2xl`}
    >
      <Text className="text-[#B6B6B5] text-[15px]">{day}</Text>
      <Text className={`${textClass} text-[24px] font-bold`}>
        Day {dayNumber}
      </Text>
    </TouchableOpacity>
  );
}
