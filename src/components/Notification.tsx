import { Text, TouchableOpacity, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { Notification as NotificationType } from "../api/types";

interface NotificationProps {
  notification?: NotificationType | null;
  onClose?: () => void;
}

export default function Notification({ notification, onClose }: NotificationProps) {
  if (!notification) return null;

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.kind) {
      case "SUCCESS":
        return "checkmark-circle";
      case "WARNING":
        return "warning";
      case "ERROR":
        return "alert-circle";
      case "PENDING":
        return "time";
      default:
        return "notifications";
    }
  };

  return (
    <View className="flex-row items-center justify-between  bg-[#F4F0E9] border border-[#7E7A72] px-2 py-4 rounded-lg">
      <View className="flex-row gap-2 items-center">
        <View className="size-[30px] items-center justify-center bg-[#B8956A] rounded-full">
          <Ionicons name={getIcon()} color="white" size={21} />
        </View>

        <View className="gap-px">
          <Text className="text-[15px] font-bold">
            {notification.title}
          </Text>
          <Text className="text-[12px] text-[#7E7A72]">
            {notification.body}
          </Text>
        </View>
      </View>

      {onClose && (
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" color="black" size={22} />
        </TouchableOpacity>
      )}
    </View>
  );
}
