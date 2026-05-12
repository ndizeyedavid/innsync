import { useState, useRef } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";

interface IOTPInput {
  length?: number;
  onComplete: (otp: string) => void;
}

export default function OTPInput({ length = 6, onComplete }: IOTPInput) {
  const [otp, setOTP] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    if (newOTP.every((digit) => digit !== "")) {
      onComplete(newOTP.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="gap-4">
      <Text className="text-[15px] text-[#9C988E]">ENTER OTP</Text>
      <View className="flex-row justify-between gap-2">
        {Array.from({ length }, (_, index) => (
          <View key={index} className="flex-1 aspect-square">
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              className="w-full h-full border-2 border-[#E8E5DD] bg-white rounded-lg text-center text-xl font-semibold"
              maxLength={1}
              value={otp[index]}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              textAlign="center"
              selectionColor="#0a0a08"
            />
          </View>
        ))}
      </View>
      <Text className="text-[13px] text-[#9C988E] text-center">
        Enter the 6-digit code sent to your phone
      </Text>
      <TouchableOpacity className="items-center">
        <Text className="text-[13px] text-[#4f4f4f] font-bold text-center">
          Resend OTP Code
        </Text>
      </TouchableOpacity>
    </View>
  );
}
