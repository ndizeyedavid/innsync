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

export default function SignupScreen() {
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
        contentContainerStyle={{ flexGrow: 1, marginTop: 70 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="text-[12px] text-[#9C988E]">INNSYNC</Text>
          <Text className="text-[35px] ">Create a new account.</Text>
          <Text className="text-[#9C988E] text-[14px]">
            Manage your reservation and digital key with ease.
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

        <View className="mt-[29px] gap-7">
          <View className="flex-row  items-center gap-4">
            <TextField
              text="FIRST NAME"
              icon="person"
              placeholder="e.g Mellow"
              keyboardType="text"
              autoCapitalize="words"
              width="fit"
            />
            <TextField
              text="LAST NAME"
              icon="person"
              placeholder="e.g Junior"
              keyboardType="text"
              autoCapitalize="words"
              width="fit"
            />
          </View>

          <TextField
            text="EMAIL ADDRESS"
            icon="mail"
            placeholder="e.g mellow@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PhoneInput value={phoneNumber} onChangeText={setPhoneNumber} />
          <TextField
            text="PASSWORD"
            icon="lock-closed"
            placeholder="********"
            keyboardType="text"
            autoCapitalize="none"
            secureTextEntry={true}
          />
          <TextField
            text="CONFIRM PASSWORD"
            icon="lock-closed"
            placeholder="********"
            keyboardType="text"
            autoCapitalize="none"
            secureTextEntry={true}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-row items-center justify-center gap-1 py-[18px] bg-[#0a0a08] rounded-[12px] mt-[28px]"
        >
          <Text className="text-white text-[24px]">Sign me up</Text>
          <Ionicons name="arrow-forward" size={23} style={{ color: "white" }} />
        </TouchableOpacity>

        <View className="items-center mt-[14px]">
          <Text className="items-center text-[#6E6B63] text-[15px]">
            Already have an account?{" "}
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text className="relative top-1 text-[#11110f] underline">
                Login
              </Text>
            </TouchableOpacity>
          </Text>
        </View>

        <View className="items-center w-full mt-3 mb-6">
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
