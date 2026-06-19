import React, { useState } from "react";
import { Text, View } from "react-native";
import PaymentOption from "../PaymentOption";
import { paymentOptions } from "../../constants/paymentOptions";
import { vibeCards } from "../../constants/vibeCards";
import { mealPlans } from "../../constants/mealPlans";

interface ReviewAndPayProps {
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  roomPreference?: string;
  bedPreference?: string;
  floorPreference?: string;
  selectedMealPlanId: string;
  specialRequests?: string;
  selectedVibeIndices: number[];
  dietaryRestrictions: string[];
}

export default function ReviewAndPay({
  checkIn,
  checkOut,
  adults,
  children,
  roomPreference,
  bedPreference,
  floorPreference,
  selectedMealPlanId,
  selectedVibeIndices,
  dietaryRestrictions,
}: ReviewAndPayProps) {
  // const selectedMealPlan = mealPlans.find((plan) => plan.id === selectedMealPlanId);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<number>(0);

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();

  const selectedMealPlan = mealPlans.find(
    (plan) => plan.id === selectedMealPlanId,
  );
  const tags = [];
  if (checkIn && checkOut) {
    tags.push(`${formatDate(checkIn)} → ${formatDate(checkOut)}`);
  }
  tags.push(`${adults} adult${adults !== 1 ? "s" : ""}`);
  if (children > 0) {
    tags.push(`${children} child${children !== 1 ? "ren" : ""}`);
  }
  if (roomPreference) tags.push(roomPreference);
  if (bedPreference) tags.push(bedPreference);
  if (floorPreference) tags.push(floorPreference);
  tags.push(selectedMealPlan?.title || "");

  if (selectedVibeIndices.length > 0) {
    tags.push(
      `${selectedVibeIndices.length} vibe${selectedVibeIndices.length !== 1 ? "s" : ""}`,
    );
  }
  if (dietaryRestrictions.length > 0) {
    tags.push(
      `${dietaryRestrictions.length} dietary restriction${dietaryRestrictions.length !== 1 ? "s" : ""}`,
    );
  }

  return (
    <View className="mb-[200px]">
      <View className="bg-white border border-[#E8E5DD] px-[20px] py-[24px] rounded-[10px] mt-6">
        <View className="flex-row items-center gap-[6px]">
          <Text className="text-[15px] font-medium text-[#9C988E]">
            BOOKING SUMMARY
          </Text>
        </View>

        <View className="mt-3 gap-4">
          <CheckoutDetail
            title={`Stay - ${nights} night${nights !== 1 ? "s" : ""}`}
            description={`${adults} adult${adults !== 1 ? "s" : ""}${children > 0 ? `, ${children} child${children !== 1 ? "ren" : ""}` : ""}`}
            price="To be confirmed"
          />
          <CheckoutDetail
            title={`Meal Plan: ${selectedMealPlan?.title}`}
            description={selectedMealPlan?.description}
            price=""
          />
          {selectedVibeIndices.length > 0 && (
            <CheckoutDetail
              title="Vibes"
              description={selectedVibeIndices
                .map((i) => vibeCards[i].title)
                .join(", ")}
              price=""
            />
          )}
          {dietaryRestrictions.length > 0 && (
            <CheckoutDetail
              title="Dietary Restrictions"
              description={dietaryRestrictions.join(", ")}
              price=""
            />
          )}

          {/* total summary */}
          <View className="flex-row flex-wrap gap-2 mt-4">
            {tags.map((text, index) => (
              <View
                key={index}
                className="px-[11px] py-[4px] bg-[#F5F4EF] rounded-[2px]"
              >
                <Text className="text-[12px]">{text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="mt-4 gap-2">
        {paymentOptions.map((data, index) => (
          <PaymentOption
            key={index}
            id={data.id}
            icon={data.icon}
            title={data.title}
            description={data.description}
            checked={selectedPaymentOption == data.id}
            setSelectedPaymentOption={setSelectedPaymentOption}
          />
        ))}
      </View>
    </View>
  );
}

interface ICheckoutDetail {
  title: string;
  description?: string;
  price: string;
}

function CheckoutDetail({ title, description, price }: ICheckoutDetail) {
  return (
    <View className="flex-row justify-between">
      <View className="flex-1">
        <Text className="text-[16px]">{title}</Text>
        {description && (
          <Text className="text-[12px] text-[#9C988E]">{description}</Text>
        )}
      </View>
      {price ? <Text className="text-[16px]">{price}</Text> : null}
    </View>
  );
}
