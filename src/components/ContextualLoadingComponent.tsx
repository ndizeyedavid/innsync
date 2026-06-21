import { Text, ActivityIndicator, View, Image } from "react-native";

interface IContextualLoadingComponent {
  text?: string;
}

export default function ContextualLoadingComponent({
  text = "Loading...",
}: IContextualLoadingComponent) {
  return (
    <View className="flex-1 items-center justify-between bg-white py-12">
      {/* Top spacer to center the logo vertically */}
      <View className="h-0" />

      {/* Center logo/branding */}
      <View className="items-center gap-6">
        <Image
          source={require("../assets/images/logo/logo-single.png")}
          className="size-40 object-cover"
        />
        <View className="items-center gap-2">
          <ActivityIndicator size="large" color="#283D5A" />
          <Text className="text-lg text-gray-600 text-center">{text}</Text>
        </View>
      </View>

      {/* Bottom branding */}
      <View className="items-center gap-2">
        <Text className="text-gray-500">Powered By</Text>
        <Text className="text-gray-500 relative bottom-1 text-[18px] font-semibold">
          The Fremen
        </Text>
      </View>
    </View>
  );
}
