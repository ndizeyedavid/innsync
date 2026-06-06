import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState, useEffect } from "react";
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

export default function OrdersScreen() {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [activeOrders, setActiveOrders] = useState<OrderResponseDto[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Food",
    "Drinks",
    "Activities",
    "Room Service",
    "Gaming",
    "Workshops",
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load active orders
      const ordersData = await ordersService.getActiveOrders();
      setActiveOrders(ordersData);

      // Load menu items
      const menuData = await menuService.list();
      setMenuItems(menuData);
    } catch (error) {
      console.error("Error loading orders data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items based on selected category
  const filteredMenuItems = menuItems.filter((item) => {
    // Simple category mapping - this can be refined
    const categoryIndex = categories.findIndex(
      (cat) =>
        item.category === cat.toUpperCase() ||
        item.category?.includes(cat.toUpperCase()),
    );
    return selectedCategory === 0 || categoryIndex === selectedCategory;
  });

  // Convert menu items to order card format
  const orderItems = filteredMenuItems.map((item) => ({
    image: item.imageUrl
      ? { uri: item.imageUrl }
      : require("../assets/images/order-1.jpg"),
    title: item.name,
    description: item.description || "",
    price: `${item.price} ${item.currency}`,
    time: item.preparationTime ? `${item.preparationTime} Min` : "15 Min",
  }));

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
            activeOrders.map((order) => <OrderProgress key={order.id} />)
          ) : (
            <Text className="text-[#9C988E] text-[14px]">No active orders</Text>
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
    </ScreenLayout>
  );
}
