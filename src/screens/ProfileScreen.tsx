import { Text, TouchableOpacity, View } from "react-native";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import ProfileCard from "../components/profileComponents/ProfileCard";
import SettingItem from "../components/profileComponents/SettingItem";

export default function ProfileScreen() {
  const settingItems = [
    {
      icon: "card-outline",
      title: "Payment methods",
      description: "Visa, MTN MoMo",
    },
    {
      icon: "bluetooth-outline",
      title: "Digital key",
      description: "Bluetooh, backup PIN",
    },
    {
      icon: "globe-outline",
      title: "Language & Currency",
      description: "English, USD",
    },
    {
      icon: "person-outline",
      title: "Account",
      description: "Manage name, email, phone,...",
    },
    {
      icon: "help-circle-outline",
      title: "Help",
      description: "About this app",
    },
  ];
  return (
    <ScreenLayout>
      <TabHeader alt="ACCOUNT" title="Profile" />
      <ProfileCard />

      {/* Stay details */}
      <View className="bg-white border border-[#EFEDE7] rounded-3xl overflow-hidden mt-5">
        <View className="gap-2 py-[20px] px-[27px] border-b-2 border-[#EFEDE7]">
          <Text className="text-[12px] text-[#A4A097]">CURRENT STAY</Text>
          <Text className="text-[24px]">The Fremen House</Text>
          <Text className="text-[12px] text-[#A4A097]">
            April 26 - April 30 · Suite 1207
          </Text>
        </View>
        <View className="flex-row justify-between">
          <TouchableOpacity className="flex-row items-center justify-between border-r-2 border-[#EFEDE7] px-[15px] py-[22px]">
            <View className="flex-row items-center gap-1">
              <Ionicons name="receipt" size={18} color="black" />
              <Text className="text-[18px]">View folio</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9C988E" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between border-r-2 border-[#EFEDE7] px-[15px] py-[22px]">
            <View className="flex-row items-center gap-1">
              <Ionicons name="refresh" size={20} color="black" />
              <Text className="text-[18px] w-[90px]">Restart check-in</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9C988E" />
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-[18px] text-[#ACA9A0] mt-6 mb-3">SETTINGS</Text>

      <View className="bg-white border border-[#EFEDE7] rounded-3xl overflow-hidden">
        {settingItems.map((item, index) => (
          <SettingItem
            key={index}
            icon={item.icon}
            title={item.title}
            description={item.description}
          />
        ))}
      </View>
    </ScreenLayout>
  );
}
