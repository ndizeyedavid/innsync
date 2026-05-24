import { Text, TouchableOpacity, View, ScrollView } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";

export default function PaymentMethodsScreen() {
  const router = useRouter();

  const paymentMethods = [
    {
      id: "1",
      type: "card",
      name: "Visa",
      description: "•••• 4582",
      isDefault: true,
      icon: "card-outline",
    },
    {
      id: "2",
      type: "mobile",
      name: "MTN MoMo",
      description: "+233 24 123 4567",
      isDefault: false,
      icon: "phone-portrait-outline",
    },
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

      <TabHeader alt="SETTINGS" title="Payment Methods" />

      {/* Current Methods */}
      <Text className="text-[18px] text-[#ACA9A0] mt-4 mb-3">SAVED METHODS</Text>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          {paymentMethods.map((method, index) => (
            <View
              key={method.id}
              className={`p-4 border-b border-[#EFEDE7] ${index === paymentMethods.length - 1 ? 'border-b-0' : ''}`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="size-12 bg-[#F5F4EF] rounded-full items-center justify-center">
                    <Ionicons name={method.icon} size={24} color="black" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-base font-semibold">{method.name}</Text>
                      {method.isDefault && (
                        <View className="bg-black px-2 py-0.5 rounded-full">
                          <Text className="text-white text-xs font-semibold">Default</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-[#6E6B63]">{method.description}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="#9C988E" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add New Method */}
        <TouchableOpacity
          className="bg-white border-2 border-dashed border-[#EFEDE7] rounded-2xl p-4 mt-4 items-center"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="add-circle-outline" size={24} color="#000" />
            <Text className="text-base font-semibold">Add Payment Method</Text>
          </View>
        </TouchableOpacity>

        {/* Payment Methods Info */}
        <View className="bg-[#F5F4EF] rounded-2xl p-4 mt-4">
          <Text className="text-sm font-semibold mb-2">Payment Methods</Text>
          <Text className="text-xs text-[#6E6B63] leading-relaxed">
            Manage your payment methods for hotel bookings and services. You can add or remove payment methods at any time. Your default payment method will be used for all transactions unless you specify otherwise.
          </Text>
        </View>

        {/* Security Notice */}
        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-4">
          <View className="flex-row items-start gap-3">
            <Ionicons name="shield-checkmark" size={20} color="#2563EB" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-blue-800 mb-1">
                Secure Payments
              </Text>
              <Text className="text-xs text-blue-700 leading-relaxed">
                All payment information is encrypted and securely stored. We never share your payment details with third parties.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}