import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { MenuItem } from "../../api/types";

interface OrderDetailsModalProps {
  visible: boolean;
  menuItem: MenuItem | null;
  stayId: string | null;
  onClose: () => void;
  onAddToOrder: (
    item: MenuItem,
    quantity: number,
    notes: string,
  ) => Promise<void>;
}

export default function OrderDetailsModal({
  visible,
  menuItem,
  stayId,
  onClose,
  onAddToOrder,
}: OrderDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Reset state when menuItem changes
  React.useEffect(() => {
    if (menuItem) {
      setQuantity(1);
      setSpecialInstructions("");
    }
  }, [menuItem]);

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAdd = async () => {
    if (!menuItem || !stayId) return;

    try {
      setIsAdding(true);
      await onAddToOrder(menuItem, quantity, specialInstructions);
      onClose();
    } catch (error) {
      console.error("Failed to add to order:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Calculate price safely
  const getPriceAndCurrency = () => {
    if (!menuItem) return { price: 0, currency: "USD" };

    let priceValue: number = 0;
    let currencyValue: string = "USD";

    // Check for price in multiple possible fields
    if (typeof menuItem.price === "number") {
      priceValue = menuItem.price;
    } else if (typeof (menuItem as any).amount === "number") {
      priceValue = (menuItem as any).amount;
    } else if (typeof (menuItem as any).priceCents === "number") {
      priceValue = (menuItem as any).priceCents / 100;
    } else if (typeof (menuItem as any).priceInCents === "number") {
      priceValue = (menuItem as any).priceInCents / 100;
    }

    // Check for currency in multiple possible fields
    if (menuItem.currency) {
      currencyValue = menuItem.currency;
    } else if ((menuItem as any).currencyCode) {
      currencyValue = (menuItem as any).currencyCode;
    } else if ((menuItem as any).currency_code) {
      currencyValue = (menuItem as any).currency_code;
    }

    return { price: priceValue, currency: currencyValue };
  };

  const getItemPriceText = () => {
    const { price } = getPriceAndCurrency();
    return price.toFixed(2);
  };

  const getTotalPriceText = () => {
    const { price } = getPriceAndCurrency();
    return (price * quantity).toFixed(2);
  };

  const getCurrencyText = () => {
    return getPriceAndCurrency().currency;
  };

  if (!menuItem) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl w-full"
            style={{ maxHeight: "90%" }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-[#EFEDE7]">
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Order Details</Text>
              <View className="w-10" />
            </View>

            <ScrollView className="px-5 py-4">
              {/* Menu Item Image */}
              <View className="w-full h-64 rounded-2xl overflow-hidden mb-4">
                <Image
                  source={
                    menuItem.imageUrl
                      ? { uri: menuItem.imageUrl }
                      : require("../../assets/images/order-1.jpg")
                  }
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>

              {/* Menu Item Info */}
              <View className="mb-6">
                <Text className="text-2xl font-semibold mb-2">
                  {menuItem.name}
                </Text>
                <Text className="text-[#A4A097] text-base mb-4">
                  {menuItem.description || "No description available"}
                </Text>
                <Text className="text-2xl font-bold text-[#3F6B4F]">
                  {getItemPriceText()} {getCurrencyText()}
                </Text>
              </View>

              {/* Quantity Selector */}
              <View className="flex-row items-center justify-between mb-6 bg-[#F4F0E7] p-4 rounded-2xl">
                <Text className="text-base font-medium">Quantity</Text>
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    onPress={handleDecrement}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full bg-white border border-[#EFEDE7] items-center justify-center"
                  >
                    <Ionicons name="remove" size={20} color="black" />
                  </TouchableOpacity>
                  <Text className="text-xl font-semibold w-8 text-center">
                    {quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={handleIncrement}
                    className="w-10 h-10 rounded-full bg-black items-center justify-center"
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Special Instructions */}
              <View className="mb-6">
                <Text className="text-base font-medium mb-2">
                  Special Instructions
                </Text>
                <TextInput
                  className="border border-[#EFEDE7] rounded-2xl p-4 text-base bg-white min-h-[100px] textAlignVertical-top"
                  placeholder="Any special requests or dietary requirements?"
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Preparation Time */}
              {menuItem.preparationTime && (
                <View className="flex-row items-center gap-2 mb-6">
                  <Ionicons name="timer-outline" size={20} color="#A4A097" />
                  <Text className="text-[#A4A097] text-base">
                    Est. preparation time: {menuItem.preparationTime} minutes
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Footer with Add Button */}
            <View className="p-5 border-t border-[#EFEDE7]">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base">Total</Text>
                <Text className="text-2xl font-bold">
                  {getTotalPriceText()} {getCurrencyText()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleAdd}
                disabled={isAdding || !stayId}
                className="bg-black rounded-3xl py-4 flex-row items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAdding ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="cart-outline" size={20} color="white" />
                    <Text className="text-white text-base font-semibold">
                      Add to Order
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
