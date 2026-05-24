import { Text, TouchableOpacity, View, ScrollView } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";

export default function ViewFolioScreen() {
  const router = useRouter();

  const folioItems = [
    {
      id: "1",
      date: "April 26, 2024",
      description: "Room Charge - Suite 1207",
      amount: 350.00,
      status: "posted",
    },
    {
      id: "2",
      date: "April 27, 2024",
      description: "Room Service - Dinner",
      amount: 85.50,
      status: "posted",
    },
    {
      id: "3",
      date: "April 27, 2024",
      description: "Spa Treatment - Massage",
      amount: 120.00,
      status: "posted",
    },
    {
      id: "4",
      date: "April 28, 2024",
      description: "Mini Bar",
      amount: 45.00,
      status: "pending",
    },
    {
      id: "5",
      date: "April 28, 2024",
      description: "Laundry Service",
      amount: 35.00,
      status: "pending",
    },
  ];

  const totalPosted = folioItems
    .filter((item) => item.status === "posted")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalPending = folioItems
    .filter((item) => item.status === "pending")
    .reduce((sum, item) => sum + item.amount, 0);

  const grandTotal = totalPosted + totalPending;

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
        <Text className="text-white text-4xl font-bold mb-4">${grandTotal.toFixed(2)}</Text>

        <View className="flex-row justify-between border-t border-gray-700 pt-3">
          <View>
            <Text className="text-[#989896] text-xs">POSTED</Text>
            <Text className="text-white text-lg font-semibold">${totalPosted.toFixed(2)}</Text>
          </View>
          <View>
            <Text className="text-[#989896] text-xs">PENDING</Text>
            <Text className="text-white text-lg font-semibold">${totalPending.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Guest Info */}
      <View className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mt-4">
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-xs text-[#A4A097]">GUEST</Text>
            <Text className="text-lg font-semibold">Mellow</Text>
          </View>
          <View className="text-right">
            <Text className="text-xs text-[#A4A097]">ROOM</Text>
            <Text className="text-lg font-semibold">Suite 1207</Text>
          </View>
        </View>
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-xs text-[#A4A097]">CHECK-IN</Text>
            <Text className="text-sm">April 26, 2024</Text>
          </View>
          <View className="text-right">
            <Text className="text-xs text-[#A4A097]">CHECK-OUT</Text>
            <Text className="text-sm">April 30, 2024</Text>
          </View>
        </View>
      </View>

      {/* Transaction List */}
      <Text className="text-[18px] text-[#ACA9A0] mt-6 mb-3">TRANSACTIONS</Text>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          {folioItems.map((item, index) => (
            <View
              key={item.id}
              className={`p-4 border-b border-[#EFEDE7] ${index === folioItems.length - 1 ? 'border-b-0' : ''}`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-sm font-semibold mb-1">{item.description}</Text>
                  <Text className="text-xs text-[#A4A097]">{item.date}</Text>
                </View>
                <View className="flex-col items-end">
                  <Text className="text-lg font-bold">${item.amount.toFixed(2)}</Text>
                  <View
                    className={`px-2 py-1 rounded-full mt-1 ${
                      item.status === "posted" ? "bg-green-100" : "bg-yellow-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        item.status === "posted" ? "text-green-700" : "text-yellow-700"
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
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