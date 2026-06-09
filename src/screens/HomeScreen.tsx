import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenLayout from "../layout/ScreenLayout";
import TabHeader from "../components/TabHeader";
import Notification from "../components/Notification";
import DigitalKey from "../components/HomeComponents/DigitalKey";
import QuickActionButton from "../components/HomeComponents/QuickActionButton";
import reservationsService from "../services/reservations.service";
import authService from "../services/auth.service";
import {
  GuestStay,
  User,
  Notification as NotificationType,
} from "../api/types";
import { useToast } from "../contexts/ToastContext";

export default function HomeScreen() {
  const [stays, setStays] = useState<GuestStay[]>([]);
  const [currentStay, setCurrentStay] = useState<GuestStay | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const { showToast } = useToast();

  const quickActions = [
    { icon: "restaurant", title: "Order food", description: "12 min Avg" },
    {
      icon: "calendar-clear",
      title: "Itinerary",
      description: currentStay ? "View your itinerary" : "View itinerary",
    },
    {
      icon: "bonfire",
      title: "Book activity",
      description: "Swimming, Hiking, etc..",
    },
    {
      icon: "cash",
      title: "View folio",
      description: "Invoice profoma & receipts",
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, staysData] = await Promise.all([
        authService.getCurrentUser(),
        reservationsService.listMine(),
      ]);
      setUser(userData);
      setStays(staysData);
      // TODO: Load notifications from API once endpoint is available
      setNotifications([]);

      // Find current active stay (checked in)
      const active =
        staysData.find((s) => s.status === "CHECKED_IN") || staysData[0];
      setCurrentStay(active);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <ScreenLayout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View className="flex-row justify-between">
        <TabHeader
          alt={
            currentStay
              ? `${currentStay.roomPreference || "No room preference"}`
              : "Welcome back"
          }
          title="Good Afternoon,"
          description={user?.name || "Guest"}
        />
        <TouchableOpacity className="size-[47px] bg-[#E9E6DE] rounded-full items-center justify-center relative">
          <Ionicons name="notifications-outline" color="black" size={24} />
          <View className="size-[8px] bg-[#A8453E] rounded-full absolute top-2 right-3" />
        </TouchableOpacity>
      </View>
      {/* Notification */}
      <View className="mt-3">
        {notifications.length > 0 && (
          <Notification
            notification={notifications[0]}
            onClose={() => {
              // TODO: Mark notification as read via API
              setNotifications((prev) => prev.slice(1));
            }}
          />
        )}
      </View>

      <View className="mt-5">
        <DigitalKey stay={currentStay} hotelName="Hotel" />
      </View>

      <View className="mt-5">
        <Text className="text-[24px]">Quick actions</Text>

        <View className="flex-row flex-wrap gap-3 mt-3">
          {quickActions.map((data, index) => (
            <QuickActionButton
              key={index}
              icon={data.icon}
              title={data.title}
              description={data.description}
            />
          ))}
        </View>
      </View>
    </ScreenLayout>
  );
}
