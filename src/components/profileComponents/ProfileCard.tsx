import { Text, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { User } from "../../api/types";

interface ProfileCardProps {
  user: User | null;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View className="bg-navy py-[30px] px-[22px] rounded-3xl ">
      <View className="flex-row items-center gap-2">
        <View className=" size-[60px] bg-[#B8956A] rounded-full items-center justify-center">
          <Text className="text-[20px] text-white uppercase font-semibold">
            {user ? getInitials(user.name) : "G"}
          </Text>
        </View>
        <View className="gap-1">
          <Text className="text-[12px] text-gray-400">PLATIMUM MEMBER</Text>

          <Text className="text-[24px] font-semibold text-white">
            {user?.name || "Guest User"}
          </Text>

          <View className="flex-row items-center gap-[5px]">
            <Ionicons name="star" color="#B8956A" size={15} />
            <Text className="text-[13px] text-gray-400">
              24,840 pts - 3 stays to diamond
            </Text>
          </View>
        </View>
      </View>

      <View className="border-b-2 border-gray-700 w-full my-[23px]" />

      {/* Stats */}
      <View className="flex-row justify-between">
        <View className="items-center gap-1">
          <Text className="text-[18px] text-white font-semibold">14</Text>
          <Text className="text-[15px] text-gray-400 uppercase">Stays</Text>
        </View>
        <View className="items-center gap-1">
          <Text className="text-[18px] text-white font-semibold">9</Text>
          <Text className="text-[15px] text-gray-400 uppercase">Orders</Text>
        </View>
        <View className="items-center gap-1">
          <Text className="text-[18px] text-white font-semibold">88</Text>
          <Text className="text-[15px] text-gray-400 uppercase">Eco Score</Text>
        </View>
      </View>
    </View>
  );
}
