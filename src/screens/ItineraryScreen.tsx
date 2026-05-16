import React, { useState } from "react";
import ScreenLayout from "../layout/ScreenLayout";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import TabHeader from "../components/TabHeader";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import TimelineItem from "../components/ItineraryComponents/TimelineItem";
import ItineraryCard from "../components/ItineraryComponents/ItineraryCard";

export default function ItineraryScreen() {
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2]);

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
    { id: 8, day: "Fri" },
  ];

  const itenraryItems = [
    {
      image: require("../assets/images/yoga.jpg"),
      time: "8:00 - 9:00",
      isBooked: true,
      title: "Sunrise yoga on the deck",
      location: "Cercle Sportif de Kigali",
      description: "Slow flow and breathwork as the sun rises over the bay.",
      isIncluded: true,
      isConfirmed: true,
    },
    {
      image: require("../assets/images/meal.png"),
      time: "11:30 - 13:00",
      isBooked: false,
      title: "Chef's table dinner",
      location: "The Freman House",
      description: "Yummy food and drinks prepared by the best chef in town.",
      isIncluded: true,
      isConfirmed: false,
    },
  ];

  return (
    <ScreenLayout>
      <View className="flex-row justify-between items-center">
        <TabHeader
          alt="RWANDA"
          title="Your itenerary,"
          description="April 26 - April 30 · 2 adults"
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
        {itenraryItems.map((item, index) => (
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
        ))}
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
