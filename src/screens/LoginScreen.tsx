import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { Animated } from "react-native";
import { LoginCredentials } from "../types";
import SocialLoginButton from "../components/SocialLoginButton";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import TextField from "../components/TextField";
import PhoneInput from "../components/PhoneInput";
import OTPInput from "../components/OTPInput";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<"email" | "phone">(
    "email",
  );
  const slideAnimation = useState(new Animated.Value(0))[0];
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const handleOptionPress = (option: "email" | "phone") => {
    setSelectedOption(option);
    setShowOTP(false);
    Animated.timing(slideAnimation, {
      toValue: option === "email" ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handlePhoneSubmit = () => {
    console.log(phoneNumber.length);
    if (phoneNumber.length >= 9) {
      // Simulate OTP sending
      setShowOTP(true);
    }
  };

  const handleOTPComplete = (otp: string) => {
    Alert.alert("Success", "OTP verification successful!");
    // Handle successful OTP verification
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#fafaf7]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="text-[12px] text-[#9C988E]">INNSYNC</Text>
          <Text className="text-[40px] ">Welcome Back.</Text>
          <Text className="text-[#9C988E] text-[14px]">
            Sign in to access your reservation and digital key.
          </Text>
        </View>

        <View className="flex-row justify-between mt-[25px]">
          <SocialLoginButton
            buttonLogo={require("../assets/google-logo.png")}
            buttonText="Google"
          />
          <SocialLoginButton
            buttonLogo={require("../assets/apple-logo.png")}
            buttonText="Apple"
          />
        </View>

        <View className="flex flex-row overflow-hidden items-center gap-1 mt-[14px]">
          <View className="w-[115px] h-px bg-[#9E9A90]" />
          <Text className="text-[12px] text-[#9E9A90]">Or Continue With</Text>
          <View className="w-[115px] h-px bg-[#9E9A90]" />
        </View>

        <View className="flex-row justify-around bg-[#f5f4ef] py-[8px] mt-[14px] rounded-[10px] relative overflow-hidden">
          <Animated.View
            style={{
              transform: [
                {
                  translateX: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    // backup: outputRange: [-82, 82],
                    outputRange: [-82, 82],
                  }),
                },
              ],
            }}
            className="absolute top-[7px]  w-[160px] h-full bg-white rounded-[7px]"
          />
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-center px-[43px] py-[13px] rounded-[7px] gap-2 z-10"
            onPress={() => handleOptionPress("email")}
          >
            <Ionicons name="mail" size={20} />
            <Text className="text-[16px] text-[#0A0A08]">Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-center px-[43px] py-[13px] rounded-[7px] gap-2 z-10"
            onPress={() => handleOptionPress("phone")}
          >
            <Ionicons name="call" size={20} />
            <Text className="text-[16px] text-[#0A0A08]">Phone</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-[39px] gap-7">
          {selectedOption === "email" ? (
            <>
              <TextField
                text="EMAIL ADDRESS"
                icon="mail"
                placeholder="e.g mellow@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextField
                text="PASSWORD"
                icon="lock-closed"
                placeholder="********"
                keyboardType="text"
                autoCapitalize="none"
                secureTextEntry={true}
              />
            </>
          ) : showOTP ? (
            <OTPInput onComplete={handleOTPComplete} />
          ) : (
            <>
              <PhoneInput value={phoneNumber} onChangeText={setPhoneNumber} />
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-row items-center justify-center gap-1 py-[18px] bg-[#0a0a08] rounded-[12px] mt-[28px]"
                onPress={handlePhoneSubmit}
              >
                <Text className="text-white text-[24px]">Send OTP</Text>
                <Ionicons
                  name="arrow-forward"
                  size={23}
                  style={{ color: "white" }}
                />
              </TouchableOpacity>
            </>
          )}
        </View>

        {selectedOption === "email" && (
          <TouchableOpacity>
            <Text className="text-[15px] text-[#6E6B63] mt-[21px]">
              Forgot password?
            </Text>
          </TouchableOpacity>
        )}

        {selectedOption === "email" && (
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-center gap-1 py-[18px] bg-[#0a0a08] rounded-[12px] mt-[28px]"
          >
            <Text className="text-white text-[24px]">Sign in</Text>
            <Ionicons
              name="arrow-forward"
              size={23}
              style={{ color: "white" }}
            />
          </TouchableOpacity>
        )}

        {!showOTP && (
          <View className="items-center mt-[14px]">
            <Text className="items-center text-[#6E6B63] text-[15px]">
              Don't have an account?{" "}
              <TouchableOpacity onPress={() => router.replace("/signup")}>
                <Text className="relative top-1 text-[#11110f] underline">
                  Create one
                </Text>
              </TouchableOpacity>
            </Text>
          </View>
        )}

        <View className="items-center w-full absolute bottom-7">
          <Text className="items-center text-[#6E6B63] text-[13px] text-center flex-row gap-2">
            By continuing you agree to our{" "}
            <TouchableOpacity>
              <Text className="relative top-1  text-[#11110f] underline">
                Terms of Service
              </Text>
            </TouchableOpacity>
            <Text> and </Text>
            <TouchableOpacity>
              <Text className="relative top-1  text-[#11110f] underline">
                Privacy Policy.
              </Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </KeyboardAvoidingView>
  );
}
