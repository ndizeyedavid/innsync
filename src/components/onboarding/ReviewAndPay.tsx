import React, { useState } from "react";
import { Text, View } from "react-native";
import PaymentOption from "../PaymentOption";
import { paymentOptions } from "../../constants/paymentOptions";

export default function ReviewAndPay() {
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<number>(0);

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
            title="Ocean Loft X 4 nights"
            description="$580/night"
            price="$2,320"
          />
          <CheckoutDetail
            title="Breakfast X 4 nights X 2 guests"
            description="$28/night/guest"
            price="$224"
          />

          <View className="gap-2">
            <View className="bg-[#F0EEE6] w-full h-px" />
            <View className="relative top-2">
              <CheckoutDetail
                title="Taxes & fees (12%)"
                description=""
                price="$305"
              />
            </View>
            <View className="bg-[#F0EEE6] w-full h-px" />
          </View>
          <CheckoutDetail title="Total" description="" price="$2849" />

          {/* total summary */}
          <View className="flex-row flex-wrap gap-2">
            {[
              "Apr 26 → Apr 30",
              "2 adults",
              "Ocean view",
              "2 vibes selected",
            ].map((text, index) => (
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
      <View>
        <Text className="text-[16px]">{title}</Text>
        <Text className="text-[12px] text-[#9C988E]">{description}</Text>
      </View>

      <Text className="text-[16px]">{price}</Text>
    </View>
  );
}
