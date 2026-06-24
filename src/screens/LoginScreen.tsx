import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { Animated } from "react-native";
import SocialLoginButton from "../components/SocialLoginButton";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import TextField from "../components/TextField";
import PhoneInput from "../components/PhoneInput";
import OTPInput from "../components/OTPInput";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";
import reservationsService from "../services/reservations.service";

import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const { showToast } = useToast();

  const [selectedOption, setSelectedOption] = useState<"email" | "phone">(
    "email",
  );
  const slideAnimation = useState(new Animated.Value(0))[0];
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const googlePromptRef = useRef(false);

  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useIdTokenAuthRequest({
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      redirectUri: "https://auth.expo.io/@davidndizeye/innsync",
    });

  useEffect(() => {
    if (googleResponse?.type !== "success" || !googlePromptRef.current) return;
    googlePromptRef.current = false;
    const idToken = googleResponse.params?.id_token;
    if (!idToken) {
      showToast("error", "No ID token received", "top");
      return;
    }
    (async () => {
      try {
        await signInWithGoogle({ idToken });
        showToast("success", "Signed in with Google!", "top");
        const stays = await reservationsService.listMine();
        if (stays.length > 0) {
          router.replace("/(tabs)");
        } else {
          router.replace("/onboarding");
        }
      } catch (error: any) {
        showToast("error", error.message || "Google sign-in failed", "top");
      }
    })();
  }, [googleResponse]);

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
      showToast("info", "OTP sent successfully!", "top");
    }
  };

  const handleOTPComplete = (otp: string) => {
    showToast("success", "OTP verification successful!", "top");
    // Handle successful OTP verification
  };

  const handleSignIn = async () => {
    try {
      if (selectedOption === "email") {
        if (!email || !password) {
          showToast("error", "Please fill in all fields", "top");
          return;
        }

        await signIn({
          email,
          password,
        });

        showToast("success", "Successfully signed in!", "top");

        // Check if user already has stays
        const stays = await reservationsService.listMine();
        if (stays.length > 0) {
          router.replace("/(tabs)");
        } else {
          router.replace("/onboarding");
        }
      }
    } catch (error: any) {
      showToast(
        "error",
        error.message || "An error occurred during sign in",
        "top",
      );
    }
  };

  const handleGoogleSignIn = () => {
    googlePromptRef.current = true;
    googlePromptAsync();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <BlurView intensity={50} tint="light" style={styles.blurContainer} />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ flexGrow: 1, paddingTop: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-start mb-4">
          <Image
            source={require("../assets/images/logo/logo-single.png")}
            className="size-[100px]"
            // style={{ width: 80, height: 80, resizeMode: "contain" }}
          />
        </View>

        <View className="mb-8">
          {/* <Text className="text-[12px] text-gray-500 mb-1">INNSYNC</Text> */}
          <Text className="text-[40px] text-navy font-semibold">
            Welcome Back.
          </Text>
          <Text className="text-gray-500 text-[14px] mt-1">
            Sign in to access your reservation and digital key.
          </Text>
        </View>

        <View className="flex-row justify-between ">
          <SocialLoginButton
            buttonLogo={require("../assets/google-logo.png")}
            buttonText="Google"
            onPress={handleGoogleSignIn}
          />
          <SocialLoginButton
            buttonLogo={require("../assets/apple-logo.png")}
            buttonText="Apple"
          />
        </View>

        <View className="flex flex-row overflow-hidden items-center gap-1 mt-[14px]">
          <View className="w-[115px] h-px bg-gray-300" />
          <Text className="text-[12px] text-gray-500">Or Continue With</Text>
          <View className="w-[115px] h-px bg-gray-300" />
        </View>

        <View className="flex-row justify-around bg-sand-100 py-[8px] mt-[14px] rounded-[10px] relative overflow-hidden">
          <Animated.View
            style={{
              transform: [
                {
                  translateX: slideAnimation.interpolate({
                    inputRange: [0, 1],
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
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              handleOptionPress("email");
            }}
          >
            <Ionicons name="mail" size={20} color="#283D5A" />
            <Text className="text-[16px] text-navy">Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-center px-[43px] py-[13px] rounded-[7px] gap-2 z-10"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              handleOptionPress("phone");
            }}
          >
            <Ionicons name="call" size={20} color="#283D5A" />
            <Text className="text-[16px] text-navy">Phone</Text>
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
                value={email}
                onChangeText={setEmail}
              />
              <TextField
                text="PASSWORD"
                icon="lock-closed"
                placeholder="********"
                keyboardType="text"
                autoCapitalize="none"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            </>
          ) : showOTP ? (
            <OTPInput onComplete={handleOTPComplete} />
          ) : (
            <>
              <PhoneInput value={phoneNumber} onChangeText={setPhoneNumber} />
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-row items-center justify-center gap-1 py-[18px] bg-cobalt rounded-[12px] mt-[28px]"
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
            <Text className="text-[15px] text-gray-600 mt-[21px]">
              Forgot password?
            </Text>
          </TouchableOpacity>
        )}

        {selectedOption === "email" && (
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-center gap-1 py-[18px] bg-cobalt rounded-[12px] mt-[28px]"
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white text-[24px]">Sign in</Text>
                <Ionicons
                  name="arrow-forward"
                  size={23}
                  style={{ color: "white" }}
                />
              </>
            )}
          </TouchableOpacity>
        )}

        {!showOTP && (
          <View className="items-center mt-[14px]">
            <Text className="items-center text-gray-600 text-[15px]">
              Don't have an account?{" "}
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text className="relative top-1 text-navy underline">
                  Create one
                </Text>
              </TouchableOpacity>
            </Text>
          </View>
        )}

        <View className="items-center w-full mt-8 mb-6">
          <Text className="items-center text-gray-500 text-[13px] text-center flex-row gap-2">
            By continuing you agree to our{" "}
            <TouchableOpacity>
              <Text className="relative top-1 text-navy underline">
                Terms of Service
              </Text>
            </TouchableOpacity>
            <Text> and </Text>
            <TouchableOpacity>
              <Text className="relative top-1 text-navy underline">
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

const styles = StyleSheet.create({
  blurContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 100,
  },
});
