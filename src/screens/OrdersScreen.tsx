import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useMemo, useCallback } from "react";
import ScreenLayout from "../layout/ScreenLayout";
import OrdersScreenSkeleton from "../components/SkeletonLayouts/OrdersScreenSkeleton";
import TabHeader from "../components/TabHeader";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import OrderProgress from "../components/ordersComponents/OrderProgress";
import RepeatLastOrder from "../components/ordersComponents/RepeatLastOrder";
import OrderCard from "../components/ordersComponents/OrderCard";
import OrderDetailsModal from "../components/ordersComponents/OrderDetailsModal";
import ordersService from "../services/orders.service";
import menuService from "../services/menu.service";
import reservationsService from "../services/reservations.service";
import {
  OrderResponseDto,
  MenuItem,
  GuestStay,
  PlaceOrderDto,
  OrderUpdateEvent,
} from "../api/types";
import { useToast } from "../contexts/ToastContext";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useOrderUpdates } from "../hooks/useWebSocket";

export default function OrdersScreen() {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [activeOrders, setActiveOrders] = useState<OrderResponseDto[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stays, setStays] = useState<GuestStay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null,
  );
  const { showToast } = useToast();
  const router = useRouter();

  // Real-time order updates
  useOrderUpdates((event: OrderUpdateEvent) => {
    console.log("Order update received:", event);
    loadData();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [ordersData, menuData, staysData] = await Promise.all([
        ordersService.getActiveOrders(),
        menuService.list(),
        reservationsService.listMine(),
      ]);
      setActiveOrders(Array.isArray(ordersData) ? ordersData : []);
      setMenuItems(Array.isArray(menuData) ? menuData : []);
      setStays(Array.isArray(staysData) ? staysData : []);
    } catch {
      // silent
    } finally {
      setRefreshing(false);
    }
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

      // Load stays to get current stayId
      const staysData = await reservationsService.listMine();
      setStays(Array.isArray(staysData) ? staysData : []);
    } catch (error) {
      console.error("Error loading orders data:", error);
      setActiveOrders([]);
      setMenuItems([]);
      setStays([]);
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

  // Get current stay ID
  const currentStayId = useMemo(() => {
    if (!Array.isArray(stays) || stays.length === 0) return null;
    // Try to find checked-in stay first, else just first stay
    const checkedIn = stays.find((s) => s.status === "CHECKED_IN");
    return (checkedIn || stays[0])?.id || null;
  }, [stays]);

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
      } else if (typeof (item as any).amount === "number") {
        priceValue = (item as any).amount;
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
        item, // Keep the original item for modal
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

  // Open the order details modal
  const handleOpenModal = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsModalVisible(true);
  };

  // Close the order details modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setSelectedMenuItem(null);
    }, 300);
  };

  // Map MenuItem category to backend order category
  const mapCategoryToOrderCategory = (
    category: MenuItem["category"],
  ): PlaceOrderDto["category"] => {
    const mapping: Record<MenuItem["category"], PlaceOrderDto["category"]> = {
      BREAKFAST: "FOOD",
      LUNCH: "FOOD",
      DINNER: "FOOD",
      SNACKS: "FOOD",
      BEVERAGES: "DRINKS",
      DESSERT: "FOOD",
    };
    return mapping[category] || "FOOD";
  };

  // Place the order
  const handleAddToOrder = async (
    menuItem: MenuItem,
    quantity: number,
    notes: string,
  ) => {
    if (!currentStayId) {
      showToast("error", "Please check in first to place an order");
      return;
    }

    // Check if current stay is in a status that allows ordering
    const currentStay = stays.find((s) => s.id === currentStayId);
    if (currentStay && currentStay.status === "PENDING") {
      showToast(
        "error",
        "Cannot order while stay is pending. Please check in first.",
      );
      handleCloseModal();
      return;
    }

    try {
      const orderDto: PlaceOrderDto = {
        stayId: currentStayId,
        category: mapCategoryToOrderCategory(menuItem.category),
        items: [
          {
            externalMenuItemId: menuItem.id,
            quantity,
            notes: notes || undefined,
          },
        ],
        notes: notes || undefined,
      };

      const newOrder = await ordersService.placeOrder(orderDto);
      // Refresh active orders
      const ordersData = await ordersService.getActiveOrders();
      setActiveOrders(Array.isArray(ordersData) ? ordersData : []);

      showToast("success", "Order placed successfully!");
      handleCloseModal(); // Close modal only on success
    } catch (error: any) {
      console.error("Error placing order:", error);

      // Show detailed error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to place order";

      showToast("error", errorMessage);
      handleCloseModal(); // Close modal on error
    }
  };

  return (
    <ScreenLayout refreshing={refreshing} onRefresh={onRefresh}>
      <View className="flex-row justify-between">
        <TabHeader
          alt="CONCIERGE"
          title="Order anything"
          description="In-room dining, drinks, activities, housekeeping."
          descriptionStyle="text-[16px] text-gray-500 mt-1"
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

      <View className="relative justify-center mt-4">
        <Ionicons
          name="search-outline"
          size={20}
          color="#9CA3AF"
          className="absolute z-10 left-4"
        />
        <TextInput
          className={`rounded-[7px] border border-gray-200 bg-white py-[18px] px-[44px]`}
          placeholder="Search dishes, drinks, services"
          placeholderTextColor="#9CA3AF"
          keyboardType="default"
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <OrdersScreenSkeleton />
      ) : (
        <View className="mt-4">
          <Text className="text-[15px] text-gray-500 uppercase">
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
              <Text className="text-gray-500 text-[14px]">
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
                className={`px-[14px] py-[9px] ${selectedCategory === index && "bg-cobalt"} rounded-3xl`}
              >
                <Text
                  className={`${selectedCategory === index ? "text-white" : "text-navy"} text-[15px]`}
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
                  onPress={() => handleOpenModal(orderItem.item)}
                  onAdd={() => handleOpenModal(orderItem.item)}
                />
              ))
            ) : (
              <Text className="text-center text-gray-500 mt-10">
                No items available in this category
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        visible={isModalVisible}
        menuItem={selectedMenuItem}
        stayId={currentStayId}
        onClose={handleCloseModal}
        onAddToOrder={handleAddToOrder}
      />
    </ScreenLayout>
  );
}
