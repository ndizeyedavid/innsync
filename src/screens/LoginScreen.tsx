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
import { LoginCredentials } from "../types";
import SocialLoginButton from "../components/SocialLoginButton";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import TextField from "../components/TextField";
import { StatusBar } from "expo-status-bar";

export default function LoginScreen() {
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

        <View className="flex-row justify-around bg-[#f5f4ef] py-[8px] mt-[14px] rounded-[10px]">
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-center px-[43px] py-[13px] rounded-[7px] bg-white gap-2"
          >
            <Ionicons name="mail" size={20} />
            <Text className="text-[16px] text-[#0A0A08]">Email</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-center px-[43px] py-[13px] rounded-[7px]  gap-2">
            <Ionicons name="call" size={20} />
            <Text className="text-[16px] text-[#0A0A08]">Phone</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-[39px] gap-7">
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
        </View>

        <TouchableOpacity>
          <Text className="text-[15px] text-[#6E6B63] mt-[21px]">
            Forgot password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-row items-center justify-center gap-1 py-[18px] bg-[#0a0a08] rounded-[12px] mt-[28px]"
        >
          <Text className="text-white text-[24px]">Sign in</Text>
          <Ionicons name="arrow-forward" size={23} style={{ color: "white" }} />
        </TouchableOpacity>

        <View className="items-center mt-[12px]">
          <Text className="items-center text-[#6E6B63] text-[15px]">
            Don't have an account?{" "}
            <TouchableOpacity>
              <Text className="relative top-1 text-[#11110f]">Create one</Text>
            </TouchableOpacity>
          </Text>
        </View>

        <View className="items-center mt-[23px] w-full">
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
