import { Text, TouchableOpacity, View, ScrollView } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";

export default function LanguageCurrencyScreen() {
  const router = useRouter();

  const languages = [
    { id: "en", name: "English", native: "English", selected: true },
    { id: "es", name: "Spanish", native: "Español", selected: false },
    { id: "fr", name: "French", native: "Français", selected: false },
    { id: "de", name: "German", native: "Deutsch", selected: false },
    { id: "zh", name: "Chinese", native: "中文", selected: false },
  ];

  const currencies = [
    { id: "usd", name: "USD", symbol: "$", selected: true },
    { id: "eur", name: "EUR", symbol: "€", selected: false },
    { id: "gbp", name: "GBP", symbol: "£", selected: false },
    { id: "jpy", name: "JPY", symbol: "¥", selected: false },
    { id: "cad", name: "CAD", symbol: "C$", selected: false },
  ];

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

      <TabHeader alt="SETTINGS" title="Language & Currency" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Current Selection */}
        <View className="bg-[#F5F4EF] rounded-2xl p-4 mt-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-500 mb-1">CURRENT SELECTION</Text>
              <Text className="text-lg font-semibold">English · USD ($)</Text>
            </View>
            <View className="size-10 bg-black rounded-full items-center justify-center">
              <Ionicons name="globe" size={20} color="white" />
            </View>
          </View>
        </View>

        {/* Language */}
        <Text className="text-[18px] text-gray-500 mt-6 mb-3">LANGUAGE</Text>

        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          {languages.map((lang, index) => (
            <TouchableOpacity
              key={lang.id}
              className={`p-4 border-b border-[#EFEDE7] ${index === languages.length - 1 ? 'border-b-0' : ''}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-semibold">{lang.name}</Text>
                  <Text className="text-sm text-[#6E6B63]">{lang.native}</Text>
                </View>
                {lang.selected && (
                  <View className="size-6 bg-black rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={14} color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Currency */}
        <Text className="text-[18px] text-[#ACA9A0] mt-6 mb-3">CURRENCY</Text>

        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          {currencies.map((currency, index) => (
            <TouchableOpacity
              key={currency.id}
              className={`p-4 border-b border-[#EFEDE7] ${index === currencies.length - 1 ? 'border-b-0' : ''}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-semibold">{currency.name}</Text>
                  <Text className="text-sm text-[#6E6B63]">{currency.symbol}</Text>
                </View>
                {currency.selected && (
                  <View className="size-6 bg-black rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={14} color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Card */}
        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-4">
          <View className="flex-row items-start gap-3">
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-blue-800 mb-1">
                Language & Currency
              </Text>
              <Text className="text-xs text-blue-700 leading-relaxed">
                Your language preference affects the app interface. Currency preference changes how prices are displayed. Changes apply immediately.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}