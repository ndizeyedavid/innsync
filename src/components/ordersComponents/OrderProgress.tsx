import { Text, View } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { OrderResponseDto } from "../../api/types";

interface OrderProgressProps {
  order?: OrderResponseDto | null;
}

export default function OrderProgress({ order }: OrderProgressProps) {
  if (!order) return null;

  // Map order status to progress steps
  const getStatusText = () => {
    switch (order.status) {
      case "pending":
        return "Pending";
      case "preparing":
        return "Preparing";
      case "on-the-way":
        return "On the way";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      case "failed":
        return "Failed";
      default:
        return "Processing";
    }
  };

  // Get completed steps based on order status
  const getCompletedSteps = () => {
    const steps = ["Preparing", "On the way", "Delivered"];
    const statusOrder = ["pending", "preparing", "on-the-way", "delivered"];
    const currentIndex = statusOrder.indexOf(order.status);
    
    return steps.map((step, index) => {
      if (order.status === "delivered") {
        return { text: step, isComplete: true };
      }
      return { text: step, isComplete: index < currentIndex };
    });
  };

  const completedSteps = getCompletedSteps();

  return (
    <View className="bg-white border border-[#EFEDE7] rounded-3xl px-4 py-5 w-[312px]">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center gap-2">
          <View className="px-[11px] py-[5px] bg-[#D9D9D9] flex-row gap-1 items-center rounded-2xl">
            <View className="size-[6px] bg-[#3F6B4F] rounded-full" />
            <Text className="text-[13px] text-[#3F6B4F]">{getStatusText()}</Text>
          </View>

          {order.etaMinutes && (
            <Text className="text-[#9C988E] text-[15px]">
              ETA IN {order.etaMinutes} MIN
            </Text>
          )}
        </View>

        <View>
          <Text className="text-[24px] text-right">
            ${(order.total / 100).toFixed(2)}
          </Text>
          <Text className="text-right text-[10px]">CHARGED TO</Text>
          <Text className="text-right text-[10px]">ROOM</Text>
        </View>
      </View>

      <Text className="text-[23px] font-semibold">
        {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
      </Text>

      <View className="mt-5">
        <View className="w-full bg-black h-[5px] rounded-[15px]" />
        <View className="flex-row items-center justify-center gap-6 mt-4">
          {completedSteps.map((step, index) => (
            <ProgressChecker key={index} text={step.text} isComplete={step.isComplete} />
          ))}
        </View>
      </View>
    </View>
  );
}

interface IProgressChecker {
  isComplete: boolean;
  text: string;
}

function ProgressChecker({ text, isComplete }: IProgressChecker) {
  return (
    <View className="items-center justify-center gap-2">
      <View
        className={`size-[40px] rounded-full items-center justify-center ${isComplete ? "bg-black" : "bg-white"} border border-[#EFEDE7]`}
      >
        {isComplete && (
          <Ionicons name="checkmark" color="white" size={30} />
        )}
      </View>
      <Text className="text-[11px] uppercase">{text}</Text>
    </View>
  );
}
