import { Text, ActivityIndicator, View, Image } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

export default function LoadingComponent() {
  return (
    <View className="flex-1 items-center justify-between bg-white py-12">
      {/* Top spacer to center the logo vertically */}
      <View className="h-0" />

      {/* Center logo/branding */}
      <View className="items-center">
        {/* <Ionicons name="planet-outline" size={90} color="#283D5A" /> */}
        <Image
          source={require("../assets/images/logo/logo-single.png")}
          className="size-[240px] object-cover"
        />
        {/* <Text className="text-3xl font-bold text-navy mt-1">InnSync</Text> */}
      </View>

      {/* Bottom branding */}
      <View className="items-center gap-2">
        <ActivityIndicator size="small" color="#283D5A" />
        <Text className="text-gray-500">Powered By</Text>
        <Text className="text-gray-500 relative bottom-1 text-[18px] font-semibold">
          The Fremen
        </Text>
      </View>
    </View>
  );
}
