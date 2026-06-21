import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import notificationsService from "../services/notifications.service";
import { Notification } from "../api/types";
import { useToast } from "../contexts/ToastContext";
import { useNotifications } from "../hooks/useWebSocket";

export default function NotificationsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [stayReminders, setStayReminders] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.listMine();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
      showToast("error", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Real-time notification updates
  useNotifications((event) => {
    console.log("New notification received:", event);
    loadNotifications();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error marking as read:", error);
      showToast("error", "Failed to mark as read");
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "ORDER_UPDATE":
        return "fast-food-outline";
      case "DIGITAL_KEY":
        return "key-outline";
      case "HOUSEKEEPING":
        return "home-outline";
      case "PROMOTION":
        return "gift-outline";
      default:
        return "notifications-outline";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "ORDER_UPDATE":
        return "#F59E0B";
      case "DIGITAL_KEY":
        return "#10B981";
      case "HOUSEKEEPING":
        return "#6366F1";
      case "PROMOTION":
        return "#EC4899";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <ScreenLayout>
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowSettings(!showSettings);
          }}
        >
          <Ionicons 
            name={showSettings ? "notifications-outline" : "settings-outline"} 
            size={24} 
            color="black" 
          />
        </TouchableOpacity>
      </View>

      <TabHeader alt="NOTIFICATIONS" title={showSettings ? "Settings" : "Notifications"} />

      <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
        {showSettings ? (
          /* Settings Section */
          <>
            <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden mb-4">
              <View className="p-4 border-b border-[#EFEDE7]">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-base font-semibold">Push Notifications</Text>
                    <Text className="text-sm text-[#6E6B63]">Receive alerts on your device</Text>
                  </View>
                  <Switch
                    value={pushEnabled}
                    onValueChange={setPushEnabled}
                    trackColor={{ false: "#EFEDE7", true: "#000" }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

              <View className="p-4 border-b border-[#EFEDE7]">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-base font-semibold">Email Notifications</Text>
                    <Text className="text-sm text-[#6E6B63]">Receive updates via email</Text>
                  </View>
                  <Switch
                    value={emailEnabled}
                    onValueChange={setEmailEnabled}
                    trackColor={{ false: "#EFEDE7", true: "#000" }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            </View>

            <Text className="text-[18px] text-[#ACA9A0] mb-3">ALERTS</Text>

            <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
              <View className="p-4 border-b border-[#EFEDE7]">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-base font-semibold">Order Updates</Text>
                    <Text className="text-sm text-[#6E6B63]">Get notified when your order status changes</Text>
                  </View>
                  <Switch
                    value={orderUpdates}
                    onValueChange={setOrderUpdates}
                    trackColor={{ false: "#EFEDE7", true: "#000" }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

              <View className="p-4">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-base font-semibold">Stay Reminders</Text>
                    <Text className="text-sm text-[#6E6B63]">Check-in and check-out reminders</Text>
                  </View>
                  <Switch
                    value={stayReminders}
                    onValueChange={setStayReminders}
                    trackColor={{ false: "#EFEDE7", true: "#000" }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            </View>
          </>
        ) : (
          /* Notifications List */
          <>
            {loading ? (
              <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#000" />
              </View>
            ) : notifications.length === 0 ? (
              <View className="py-20 items-center">
                <Ionicons name="notifications-off-outline" size={64} color="#ACA9A0" />
                <Text className="text-[#ACA9A0] text-center mt-4 text-lg">
                  No notifications yet
                </Text>
                <Text className="text-[#ACA9A0] text-center mt-2">
                  We'll notify you when something important happens
                </Text>
              </View>
            ) : (
              <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
                {notifications.map((notification, index) => (
                  <TouchableOpacity
                    key={notification.id}
                    onPress={() => !notification.read && handleMarkAsRead(notification.id)}
                    className={`p-4 border-b border-[#EFEDE7] ${
                      notification.read ? "bg-white" : "bg-[#F8F7F2]"
                    } ${index === notifications.length - 1 ? "border-b-0" : ""}`}
                  >
                    <View className="flex-row gap-3">
                      <View 
                        className="size-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: `${getIconColor(notification.type)}20` }}
                      >
                        <Ionicons 
                          name={getIconForType(notification.type)} 
                          size={20} 
                          color={getIconColor(notification.type)} 
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row justify-between items-start">
                          <Text className="text-base font-semibold flex-1">
                            {notification.title}
                          </Text>
                          {!notification.read && (
                            <View className="size-2 bg-[#DC2626] rounded-full ml-2 mt-1" />
                          )}
                        </View>
                        <Text className="text-sm text-[#6E6B63] mt-1">
                          {notification.message}
                        </Text>
                        <Text className="text-xs text-[#ACA9A0] mt-2">
                          {formatDate(notification.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
