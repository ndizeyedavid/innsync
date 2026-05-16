import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenLayout from "../layout/ScreenLayout";
import TabHeader from "../components/TabHeader";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import OrderProgress from "../components/ordersComponents/OrderProgress";
import RepeatLastOrder from "../components/ordersComponents/RepeatLastOrder";
import { useState } from "react";
import OrderCard from "../components/ordersComponents/OrderCard";

export default function OrdersScreen() {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  const orderItems = [
    {
      image: require("../assets/images/order-3.jpg"),
      title: "Coconut crusted prawns ",
      description: "Tiger prawns, lime aioli, kachumbari salad.",
      price: "$28",
      time: "30 Min",
    },
    {
      image: require("../assets/images/order-2.jpg"),
      title: "Heirloom tomato salad",
      description: "Burrata, basil oil, sourdough crumbs.",
      price: "$22",
      time: "12 Min",
    },
    {
      image: require("../assets/images/order-1.jpg"),
      title: "Some random drinks",
      description: "Coffee, Cola, Heinken.",
      price: "$40",
      time: "20 Min",
    },
  ];

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
          <OrderProgress />
          <OrderProgress />
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
          {[
            "Food",
            "Drinks",
            "Activities",
            "Room Service",
            "Gaming",
            "Workshops",
          ].map((category, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory((prev) => index)}
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
          {orderItems.map((orderItem, index) => (
            <OrderCard
              key={index}
              image={orderItem.image}
              title={orderItem.title}
              price={orderItem.price}
              description={orderItem.description}
              time={orderItem.time}
            />
          ))}
        </View>
      </View>
    </ScreenLayout>
  );
}
