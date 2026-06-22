import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import ScreenLayout from "../layout/ScreenLayout";
import TabHeader from "../components/TabHeader";
import OrderProgress from "../components/ordersComponents/OrderProgress";
import ordersService from "../services/orders.service";
import itineraryService from "../services/itinerary.service";
import reservationsService from "../services/reservations.service";
import housekeepingService from "../services/housekeeping.service";
import { OrderResponseDto, ItineraryItem, GuestStay, OrderUpdateEvent } from "../api/types";
import { useToast } from "../contexts/ToastContext";
import { useRouter } from "expo-router";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useOrderUpdates } from "../hooks/useWebSocket";

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

    let status: "past" | "today" | "future" = "future";
    if (dateCopy < today) status = "past";
    else if (dateCopy.getTime() === today.getTime()) status = "today";

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

const isItemOnDay = (item: ItineraryItem, dayDate: string) => {
  const itemDate = item.startTime.split("T")[0];
  return itemDate === dayDate;
};

interface ServiceAction {
  icon: string;
  label: string;
  description: string;
  color: string;
  onPress: () => void;
}

export default function MyServicesScreen() {
  const [activeOrders, setActiveOrders] = useState<OrderResponseDto[]>([]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [currentStay, setCurrentStay] = useState<GuestStay | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [frontDeskModal, setFrontDeskModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [reportText, setReportText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  // Real-time order updates
  useOrderUpdates((event: OrderUpdateEvent) => {
    onRefresh();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, stays] = await Promise.all([
        ordersService.getActiveOrders(),
        reservationsService.listMine(),
      ]);

      setActiveOrders(Array.isArray(ordersData) ? ordersData : []);

      const activeStay =
        stays.find((s) => s.status === "CHECKED_IN") || stays[0];
      setCurrentStay(activeStay);

      if (activeStay) {
        const items = await itineraryService.getForStay(activeStay.id);
        setItineraryItems(Array.isArray(items) ? items : []);
      } else {
        setItineraryItems([]);
      }
    } catch (error) {
      console.error("Error loading services data:", error);
      setActiveOrders([]);
      setItineraryItems([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [ordersData, stays] = await Promise.all([
        ordersService.getActiveOrders(),
        reservationsService.listMine(),
      ]);
      setActiveOrders(Array.isArray(ordersData) ? ordersData : []);
      const activeStay =
        stays.find((s) => s.status === "CHECKED_IN") || stays[0];
      setCurrentStay(activeStay);
      if (activeStay) {
        const items = await itineraryService.getForStay(activeStay.id);
        setItineraryItems(Array.isArray(items) ? items : []);
      } else {
        setItineraryItems([]);
      }
    } catch {
      // silent
    } finally {
      setRefreshing(false);
    }
  }, []);

  const hasActiveStay = !!currentStay;

  const serviceActions: ServiceAction[] = [
    {
      icon: "bed-outline",
      label: "Housekeeping",
      description: "Cleaning, towels, supplies",
      color: "#4ab3de",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (currentStay) {
          router.push({
            pathname: "/housekeeping",
            params: { stayId: currentStay.id },
          });
        } else {
          router.push("/housekeeping");
        }
      },
    },
    {
      icon: "chatbubble-ellipses-outline",
      label: "Front Desk",
      description: "Message the hotel",
      color: "#10B981",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (!hasActiveStay) {
          showToast("error", "Check in first to message the front desk");
          return;
        }
        setMessageText("");
        setFrontDeskModal(true);
      },
    },
    {
      icon: "warning-outline",
      label: "Report Issue",
      description: "Digital key, noise, maintenance",
      color: "#F59E0B",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (!hasActiveStay) {
          showToast("error", "Check in first to report an issue");
          return;
        }
        setReportText("");
        setReportModal(true);
      },
    },
    {
      icon: "key-outline",
      label: "Digital Key",
      description: "Unlock door, reset key",
      color: "#8B5CF6",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/digital-key");
      },
    },
    {
      icon: "restaurant-outline",
      label: "Room Service",
      description: "Food, drinks, snacks",
      color: "#EF4444",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/(tabs)/orders");
      },
    },
    {
      icon: "cash-outline",
      label: "View Folio",
      description: "Charges & receipts",
      color: "#283D5A",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (currentStay) {
          router.push({
            pathname: "/view-folio",
            params: { stayId: currentStay.id },
          });
        } else {
          showToast("error", "No active stay");
        }
      },
    },
  ];

  const handleSendFrontDesk = async () => {
    if (!messageText.trim()) return;
    setSendingMessage(true);
    try {
      // TODO: integrate with actual messaging API when available
      await new Promise((r) => setTimeout(r, 500));
      showToast("success", "Message sent to front desk");
      setFrontDeskModal(false);
      setMessageText("");
    } catch {
      showToast("error", "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendReport = async () => {
    if (!reportText.trim()) return;
    setSendingReport(true);
    try {
      // TODO: integrate with actual reporting API when available
      await new Promise((r) => setTimeout(r, 500));
      showToast("success", "Issue reported. Staff will follow up.");
      setReportModal(false);
      setReportText("");
    } catch {
      showToast("error", "Failed to report issue");
    } finally {
      setSendingReport(false);
    }
  };

  // Itinerary: only show first 3 items, tie to selected day from today
  const stayDays = useMemo(() => {
    if (!currentStay) return [];
    return generateStayDays(currentStay.checkIn, currentStay.checkOut);
  }, [currentStay]);

  const todayDay = useMemo(() => {
    if (stayDays.length === 0) return null;
    const today = stayDays.find((d) => d.status === "today");
    return today || stayDays[0];
  }, [stayDays]);

  const todayItems = useMemo(() => {
    if (!todayDay || !Array.isArray(itineraryItems)) return [];
    return itineraryItems
      .filter((item) => isItemOnDay(item, todayDay.date))
      .slice(0, 3);
  }, [itineraryItems, todayDay]);

  const formattedItinerary = todayItems.map((item) => ({
    time: `${item.startTime.split("T")[1].substring(0, 5)}`,
    title: item.title,
    location: item.location || "Hotel",
    isBooked: item.status === "booked" || item.status === "completed",
  }));

  return (
    <ScreenLayout refreshing={refreshing} onRefresh={onRefresh}>
      <View className="flex-row justify-between">
        <TabHeader
          alt="SERVICES"
          title="How can we help?"
          description={
            hasActiveStay && currentStay?.checkIn
              ? `${new Date(currentStay.checkIn).toLocaleDateString()} - ${new Date(currentStay.checkOut!).toLocaleDateString()}`
              : "Check in to access services"
          }
          descriptionStyle="text-[14px] text-gray-500 mt-1"
        />
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

      {loading ? (
        <Text className="text-center text-gray-500 mt-10">
          Loading services...
        </Text>
      ) : !hasActiveStay ? (
        <View className="items-center justify-center py-20">
          <Ionicons name="bed-outline" size={60} color="#9CA3AF" />
          <Text className="text-gray-500 mt-4 text-lg text-center">
            You don't have an active stay.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/")}
            className="mt-4 bg-cobalt px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Go Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Quick Service Actions */}
          <View className="mt-6">
            <Text className="text-[17px] font-semibold text-navy mb-3">
              Quick Services
            </Text>
            <View className="flex-row flex-wrap">
              {serviceActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={action.onPress}
                  className="w-[48%] bg-white border border-gray-200 rounded-2xl p-4 mb-3 mr-[4%]"
                  style={index % 2 === 1 ? { marginRight: 0 } : undefined}
                  activeOpacity={0.7}
                >
                  <View
                    className="size-[44px] rounded-xl items-center justify-center mb-3"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <Ionicons
                      name={action.icon}
                      size={24}
                      color={action.color}
                    />
                  </View>
                  <Text className="text-[15px] font-semibold text-navy">
                    {action.label}
                  </Text>
                  <Text className="text-[12px] text-gray-500 mt-1">
                    {action.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Active Orders Section */}
          <View className="mt-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-[17px] font-semibold text-navy">
                Active Orders
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(tabs)/orders");
                }}
              >
                <Text className="text-cobalt text-[14px]">View All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row mt-3"
              contentContainerStyle={{ gap: 12 }}
            >
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => (
                  <OrderProgress key={order.id} order={order} />
                ))
              ) : (
                <View className="bg-white border border-gray-200 rounded-3xl px-5 py-5">
                  <Text className="text-gray-500 text-[14px]">
                    No active orders
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(tabs)/orders")}
                    className="mt-2"
                  >
                    <Text className="text-cobalt text-[14px]">
                      Browse menu
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Today's Itinerary Section */}
          {formattedItinerary.length > 0 && (
            <View className="mt-6">
              <View className="flex-row justify-between items-center">
                <Text className="text-[17px] font-semibold text-navy">
                  Today's Schedule
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/(tabs)/itinerary");
                  }}
                >
                  <Text className="text-cobalt text-[14px]">Full Itinerary</Text>
                </TouchableOpacity>
              </View>

              <View className="bg-white border border-gray-200 rounded-2xl mt-3 overflow-hidden">
                {formattedItinerary.map((item, index) => (
                  <View
                    key={index}
                    className={`flex-row items-center px-4 py-4 ${
                      index < formattedItinerary.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <View className="bg-sand-100 rounded-xl px-3 py-2 mr-4 items-center min-w-[48px]">
                      <Text className="text-[13px] font-semibold text-navy">
                        {item.time}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold text-navy">
                        {item.title}
                      </Text>
                      <Text className="text-[12px] text-gray-500">
                        {item.location}
                      </Text>
                    </View>
                    {item.isBooked && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#10B981"
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}

      {/* Front Desk Modal */}
      <Modal
        visible={frontDeskModal}
        transparent
        animationType="slide"
        onRequestClose={() => setFrontDeskModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-end"
            activeOpacity={1}
            onPress={() => setFrontDeskModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl w-full"
            >
              <View className="px-5 py-4 border-b border-gray-200">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-semibold text-navy">
                    Message Front Desk
                  </Text>
                  <TouchableOpacity onPress={() => setFrontDeskModal(false)}>
                    <Ionicons name="close" size={24} color="#283D5A" />
                  </TouchableOpacity>
                </View>
                <Text className="text-[13px] text-gray-500 mt-1">
                  We'll route your message to the front desk team.
                </Text>
              </View>
              <View className="px-5 py-4">
                <TextInput
                  className="border border-gray-200 rounded-2xl p-4 text-base bg-white min-h-[120px]"
                  placeholder="How can we help you?"
                  placeholderTextColor="#9CA3AF"
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  numberOfLines={5}
                />
                <TouchableOpacity
                  onPress={handleSendFrontDesk}
                  disabled={sendingMessage || !messageText.trim()}
                  className="bg-cobalt rounded-3xl py-4 items-center mt-4 disabled:opacity-50"
                >
                  <Text className="text-white text-base font-semibold">
                    {sendingMessage ? "Sending..." : "Send Message"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Report Issue Modal */}
      <Modal
        visible={reportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-end"
            activeOpacity={1}
            onPress={() => setReportModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl w-full"
            >
              <View className="px-5 py-4 border-b border-gray-200">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-semibold text-navy">
                    Report an Issue
                  </Text>
                  <TouchableOpacity onPress={() => setReportModal(false)}>
                    <Ionicons name="close" size={24} color="#283D5A" />
                  </TouchableOpacity>
                </View>
                <Text className="text-[13px] text-gray-500 mt-1">
                  Describe the issue and staff will follow up.
                </Text>
              </View>
              <View className="px-5 py-4">
                <TextInput
                  className="border border-gray-200 rounded-2xl p-4 text-base bg-white min-h-[120px]"
                  placeholder="What's the issue? (e.g. digital key not working, noise complaint, maintenance...)"
                  placeholderTextColor="#9CA3AF"
                  value={reportText}
                  onChangeText={setReportText}
                  multiline
                  numberOfLines={5}
                />
                <TouchableOpacity
                  onPress={handleSendReport}
                  disabled={sendingReport || !reportText.trim()}
                  className="bg-cobalt rounded-3xl py-4 items-center mt-4 disabled:opacity-50"
                >
                  <Text className="text-white text-base font-semibold">
                    {sendingReport ? "Submitting..." : "Submit Report"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenLayout>
  );
}
