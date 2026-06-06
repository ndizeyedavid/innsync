import { Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import ProfileCard from "../components/profileComponents/ProfileCard";
import SettingItem from "../components/profileComponents/SettingItem";
import * as Haptics from "expo-haptics";
import { useAuth } from "../hooks/useAuth";
import reservationsService from "../services/reservations.service";
import { Reservation } from "../api/types";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [currentReservation, setCurrentReservation] =
    useState<Reservation | null>(null);

  useEffect(() => {
    loadCurrentStay();
  }, []);

  const loadCurrentStay = async () => {
    try {
      const reservations = await reservationsService.listMine();
      const active =
        reservations.find((r) => r.status === "CHECKED_IN") || reservations[0];
      setCurrentReservation(active);
    } catch (error) {
      console.error("Error loading current stay:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const settingItems = [
    {
      icon: "card-outline",
      title: "Payment methods",
      description: "Visa, MTN MoMo",
      route: "/payment-methods",
    },
    {
      icon: "bluetooth-outline",
      title: "Digital key",
      description: "Bluetooth, backup PIN",
      route: "/digital-key",
    },
    {
      icon: "globe-outline",
      title: "Language & Currency",
      description: "English, USD",
      route: "/language-currency",
    },
    {
      icon: "person-outline",
      title: "Account",
      description: "Manage name, email, phone,...",
      route: "/account",
    },
    {
      icon: "help-circle-outline",
      title: "Help",
      description: "About this app",
      route: "/help",
    },
    {
      icon: "log-out-outline",
      title: "Sign out",
      description: "Log out of your account",
      action: handleSignOut,
    },
  ];

  return (
    <ScreenLayout>
      <TabHeader alt="ACCOUNT" title="Profile" />
      <ProfileCard />

      {/* Stay details */}
      <View className="bg-white border border-[#EFEDE7] rounded-3xl overflow-hidden mt-5">
        <View className="gap-2 py-[20px] px-[27px] border-b-2 border-[#EFEDE7]">
          <Text className="text-[12px] text-[#A4A097]">CURRENT STAY</Text>
          <Text className="text-[24px]">
            {currentReservation?.hotelName || "The Fremen House"}
          </Text>
          <Text className="text-[12px] text-[#A4A097]">
            {currentReservation
              ? `${new Date(currentReservation.checkInDate).toLocaleDateString()} - ${new Date(currentReservation.checkOutDate).toLocaleDateString()} · ${currentReservation.roomNumber || "Suite 1207"}`
              : "April 26 - April 30 · Suite 1207"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="flex-row items-center justify-between border-r-2 border-[#EFEDE7] px-[15px] py-[22px] flex-1"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/view-folio");
            }}
          >
            <View className="flex-row items-center gap-1">
              <Ionicons name="receipt" size={18} color="black" />
              <Text className="text-[18px]">View folio</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9C988E" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between px-[15px] py-[22px] flex-1"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/restart-checkin");
            }}
          >
            <View className="flex-row items-center gap-1">
              <Ionicons name="refresh" size={20} color="black" />
              <Text className="text-[18px] w-[90px]">Restart check-in</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9C988E" />
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-[18px] text-[#ACA9A0] mt-6 mb-3">SETTINGS</Text>

      <View className="bg-white border border-[#EFEDE7] rounded-3xl overflow-hidden">
        {settingItems.map((item, index) => (
          <SettingItem
            key={index}
            icon={item.icon}
            title={item.title}
            description={item.description}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (item.action) {
                item.action();
              } else if (item.route) {
                router.push(item.route);
              }
            }}
            isLast={index === settingItems.length - 1}
          />
        ))}
      </View>
    </ScreenLayout>
  );
}
