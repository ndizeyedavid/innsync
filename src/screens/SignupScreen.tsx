import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import SocialLoginButton from "../components/SocialLoginButton";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import TextField from "../components/TextField";
import PhoneInput from "../components/PhoneInput";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async () => {
    try {
      // Validation
      if (!firstName || !lastName || !email || !password) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }

      if (password.length < 8) {
        Alert.alert("Error", "Password must be at least 8 characters");
        return;
      }

      const name = `${firstName} ${lastName}`;

      await signUp({
        email,
        name,
        password,
        phone: phoneNumber || undefined,
      });

      // Navigate to onboarding on success
      router.replace("/onboarding");
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message || "An error occurred");
    }
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
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextField
              text="LAST NAME"
              icon="person"
              placeholder="e.g Junior"
              keyboardType="text"
              autoCapitalize="words"
              width="fit"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <TextField
            text="EMAIL ADDRESS"
            icon="mail"
            placeholder="e.g mellow@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <PhoneInput value={phoneNumber} onChangeText={setPhoneNumber} />
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
          <TextField
            text="CONFIRM PASSWORD"
            icon="lock-closed"
            placeholder="********"
            keyboardType="text"
            autoCapitalize="none"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-row items-center justify-center gap-1 py-[18px] bg-[#0a0a08] rounded-[12px] mt-[28px]"
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white text-[24px]">Sign me up</Text>
              <Ionicons
                name="arrow-forward"
                size={23}
                style={{ color: "white" }}
              />
            </>
          )}
        </TouchableOpacity>

        <View className="items-center mt-[14px]">
          <Text className="items-center text-[#6E6B63] text-[15px]">
            Already have an account?{" "}
            <TouchableOpacity onPress={() => router.push("/login")}>
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
