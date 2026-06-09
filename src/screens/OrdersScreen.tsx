import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import ScreenLayout from "../layout/ScreenLayout";
import TabHeader from "../components/TabHeader";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import OrderProgress from "../components/ordersComponents/OrderProgress";
import RepeatLastOrder from "../components/ordersComponents/RepeatLastOrder";
import OrderCard from "../components/ordersComponents/OrderCard";
import ordersService from "../services/orders.service";
import menuService from "../services/menu.service";
import { OrderResponseDto, MenuItem } from "../api/types";
import { useToast } from "../contexts/ToastContext";

export default function OrdersScreen() {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [activeOrders, setActiveOrders] = useState<OrderResponseDto[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Categories mapped to backend MenuItem.category enum
  const categories = [
    "All",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
    "Beverages",
    "Dessert",
  ];

  // Backend category enum mapping
  const backendCategories: Record<string, MenuItem["category"] | null> = {
    All: null,
    Breakfast: "BREAKFAST",
    Lunch: "LUNCH",
    Dinner: "DINNER",
    Snacks: "SNACKS",
    Beverages: "BEVERAGES",
    Dessert: "DESSERT",
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load active orders
      const ordersData = await ordersService.getActiveOrders();
      setActiveOrders(Array.isArray(ordersData) ? ordersData : []);

      // Load menu items
      const menuData = await menuService.list();
      console.log("Menu data from API:", menuData);
      // Log individual items
      if (Array.isArray(menuData)) {
        menuData.forEach((item, index) => {
          console.log(`Menu item ${index}:`, item);
          console.log(`  - price: ${item.price}, type: ${typeof item.price}`);
          console.log(
            `  - currency: ${item.currency}, type: ${typeof item.currency}`,
          );
        });
      }
      setMenuItems(Array.isArray(menuData) ? menuData : []);
    } catch (error) {
      console.error("Error loading orders data:", error);
      setActiveOrders([]);
      setMenuItems([]);
      showToast("error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items based on selected category
  const filteredMenuItems = useMemo(() => {
    if (!Array.isArray(menuItems)) return [];

    if (selectedCategory === 0) return menuItems;

    const targetCategory = backendCategories[categories[selectedCategory]];
    if (!targetCategory) return menuItems;
    return menuItems.filter((item) => item.category === targetCategory);
  }, [menuItems, selectedCategory]);

  // Convert menu items to order card format
  const orderItems = useMemo(() => {
    if (!Array.isArray(filteredMenuItems)) return [];

    return filteredMenuItems.map((item, index) => {
      // Log each item for debugging
      console.log(`Processing order item ${index}:`, item);

      // Handle price - check for possible field names
      let priceValue: number | null = null;
      let currencyValue: string | null = null;

      // Check for price in multiple possible fields
      if (typeof item.price === "number") {
        priceValue = item.price;
      } else if (typeof item.amount === "number") {
        priceValue = item.amount;
      } else if (typeof (item as any).priceCents === "number") {
        priceValue = (item as any).priceCents / 100;
      } else if (typeof (item as any).priceInCents === "number") {
        priceValue = (item as any).priceInCents / 100;
      }

      // Check for currency in multiple possible fields
      if (item.currency) {
        currencyValue = item.currency;
      } else if ((item as any).currencyCode) {
        currencyValue = (item as any).currencyCode;
      } else if ((item as any).currency_code) {
        currencyValue = (item as any).currency_code;
      }

      // Handle price formatting
      let priceText = "Price unavailable";
      if (priceValue !== null && currencyValue) {
        // Format price as currency
        priceText = `${priceValue.toFixed(2)} ${currencyValue}`;
      } else if (priceValue !== null) {
        // Just show price without currency
        priceText = `${priceValue.toFixed(2)} USD`;
      } else if (currencyValue) {
        // Just show currency with 0 price
        priceText = `0.00 ${currencyValue}`;
      } else {
        // Fallback to a reasonable default
        priceText = "0.00 USD";
      }

      return {
        image: item.imageUrl
          ? { uri: item.imageUrl }
          : require("../assets/images/order-1.jpg"),
        title: item.name,
        description: item.description || "",
        price: priceText,
        time: item.preparationTime ? `${item.preparationTime} Min` : "15 Min",
      };
    });
  }, [filteredMenuItems]);

  return (
    <ScreenLayout>
      <TabHeader
        alt="CONCIERGE"
        title="Order anything"
        description="In-room dining, drinks, activities, housekeeping."
        descriptionStyle="text-[16px] text-[#9C988E] mt-1"
      />

      <View className="relative justify-center mt-4">
        <Ionicons
          name="search-outline"
          size={20}
          color="#9C988E"
          className="absolute z-10 left-4"
        />
        <TextInput
          className={`rounded-[7px] border border-[#E8E5DD] bg-white py-[18px] px-[44px]`}
          placeholder="Search dishes, drinks, services"
          placeholderTextColor="#9C988E"
          keyboardType="default"
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <Text className="text-center text-[#9C988E] mt-10">
          Loading orders...
        </Text>
      ) : (
        <View className="mt-4">
          <Text className="text-[15px] text-[#9C988E] uppercase">
            In Progress
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-3 mt-2"
            contentContainerStyle={{ gap: 12 }}
          >
            {activeOrders.length > 0 ? (
              activeOrders.map((order) => (
                <OrderProgress key={order.id} order={order} />
              ))
            ) : (
              <Text className="text-[#9C988E] text-[14px]">
                No active orders
              </Text>
            )}
          </ScrollView>

          <View className="mt-4">
            <RepeatLastOrder />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-3 mt-4"
            contentContainerStyle={{ gap: 12 }}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(index)}
                className={`px-[14px] py-[9px] ${selectedCategory === index && "bg-black"} rounded-3xl`}
              >
                <Text
                  className={`${selectedCategory === index ? "text-white" : "text-black"} text-[15px]`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View className="mt-5 gap-5">
            {orderItems.length > 0 ? (
              orderItems.map((orderItem, index) => (
                <OrderCard
                  key={index}
                  image={orderItem.image}
                  title={orderItem.title}
                  price={orderItem.price}
                  description={orderItem.description}
                  time={orderItem.time}
                />
              ))
            ) : (
              <Text className="text-center text-[#9C988E] mt-10">
                No items available in this category
              </Text>
            )}
          </View>
        </View>
      )}
    </ScreenLayout>
  );
}
