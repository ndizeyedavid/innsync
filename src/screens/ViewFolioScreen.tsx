import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import billingService from "../services/billing.service";
import reservationsService from "../services/reservations.service";
import { Folio, GuestStay } from "../api/types";
import { useToast } from "../contexts/ToastContext";

export default function ViewFolioScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [folio, setFolio] = useState<Folio | null>(null);
  const [currentStay, setCurrentStay] = useState<GuestStay | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const stays = await reservationsService.listMine();
      const activeStay =
        stays.find((s) => s.status === "CHECKED_IN") || stays[0];
      setCurrentStay(activeStay || null);

      if (activeStay) {
        const folioData = await billingService.getFolio(activeStay.id);
        setFolio(folioData);
      }
    } catch (error) {
      console.error("Error loading folio data:", error);
      showToast("error", "Failed to load folio");
    } finally {
      setLoading(false);
    }
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
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        className="mb-4"
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <TabHeader alt="CURRENT STAY" title="View Folio" />

      {/* Summary Card */}
      <View className="bg-black rounded-2xl p-5 mt-4">
        <Text className="text-[#989896] text-sm mb-2">TOTAL BALANCE</Text>
        <Text className="text-white text-4xl font-bold mb-4">
          {folio ? `${folio.currency} ${folio.balanceDue.toFixed(2)}` : "$0.00"}
        </Text>

        <View className="flex-row justify-between border-t border-gray-700 pt-3">
          <View>
            <Text className="text-[#989896] text-xs">TOTAL</Text>
            <Text className="text-white text-lg font-semibold">
              {folio
                ? `${folio.currency} ${folio.totalAmount.toFixed(2)}`
                : "$0.00"}
            </Text>
          </View>
        </View>
      </View>

      {/* Guest Info */}
      <View className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mt-4">
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-xs text-[#A4A097]">GUEST</Text>
            <Text className="text-lg font-semibold">
              {folio?.guestName || user?.name || "Guest"}
            </Text>
          </View>
          <View className="text-right">
            <Text className="text-xs text-[#A4A097]">ROOM</Text>
            <Text className="text-lg font-semibold">
              {folio?.roomNumber ||
                currentStay?.roomPreference ||
                "Not assigned"}
            </Text>
          </View>
        </View>
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-xs text-[#A4A097]">CHECK-IN</Text>
            <Text className="text-sm">
              {currentStay
                ? new Date(currentStay.checkIn).toLocaleDateString()
                : ""}
            </Text>
          </View>
          <View className="text-right">
            <Text className="text-xs text-[#A4A097]">CHECK-OUT</Text>
            <Text className="text-sm">
              {currentStay
                ? new Date(currentStay.checkOut).toLocaleDateString()
                : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Transaction List */}
      <Text className="text-[18px] text-[#ACA9A0] mt-6 mb-3">TRANSACTIONS</Text>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          {folio && folio.lines.length > 0 ? (
            folio.lines.map((item, index) => (
              <View
                key={item.id}
                className={`p-4 border-b border-[#EFEDE7] ${
                  index === folio.lines.length - 1 ? "border-b-0" : ""
                }`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold mb-1">
                      {item.description}
                    </Text>
                    <Text className="text-xs text-[#A4A097]">
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="flex-col items-end">
                    <Text className="text-lg font-bold">
                      {item.currency} {item.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="p-6 items-center">
              <Ionicons name="receipt-outline" size={40} color="#ACA9A0" />
              <Text className="text-[#ACA9A0] text-center mt-2">
                No transactions yet
              </Text>
            </View>
          )}
        </View>

        {/* Download Button */}
        <TouchableOpacity
          className="bg-black py-4 rounded-2xl mt-4 items-center"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="download-outline" size={20} color="white" />
            <Text className="text-white font-semibold">Download Folio</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}
