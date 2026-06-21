import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  StyleSheet,
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
import { useToast } from "../contexts/ToastContext";
import reservationsService from "../services/reservations.service";
import { BlurView } from "expo-blur";

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const { showToast } = useToast();

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
        showToast("error", "Please fill in all required fields", "top");
        return;
      }

      if (password !== confirmPassword) {
        showToast("error", "Passwords do not match", "top");
        return;
      }

      if (password.length < 8) {
        showToast("error", "Password must be at least 8 characters", "top");
        return;
      }

      const name = `${firstName} ${lastName}`;

      const signUpData: any = {
        email,
        name,
        password,
      };

      if (phoneNumber && phoneNumber.trim() !== "") {
        signUpData.phone = phoneNumber;
      }

      console.log("Sign up data:", signUpData);

      await signUp(signUpData);

      showToast("success", "Account created successfully!", "top");

      // Navigate to welcome screen
      router.replace("/welcome");
    } catch (error: any) {
      showToast(
        "error",
        error.message || "An error occurred during sign up",
        "top",
      );
    }
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
        {/* Logo Section */}
        <View className="items-start mb-4">
          <Image
            source={require("../assets/images/logo/logo-single.png")}
            className="size-[100px]"
            // style={{ width: 80, height: 80, resizeMode: "contain" }}
          />
          {/* <Text className="text-xl font-bold text-navy mt-2">InnSync</Text> */}
        </View>

        <View className="mb-8">
          {/* <Text className="text-[12px] text-gray-500 mb-1">INNSYNC</Text> */}
          <Text className="text-[35px] text-navy font-semibold">
            Create a new account.
          </Text>
          <Text className="text-gray-500 text-[14px] mt-1">
            Manage your reservation and digital key with ease.
          </Text>
        </View>

        <View className="flex-row justify-between ">
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
          <View className="w-[115px] h-px bg-gray-300" />
          <Text className="text-[12px] text-gray-500">Or Continue With</Text>
          <View className="w-[115px] h-px bg-gray-300" />
        </View>

        <View className="mt-[29px] gap-7">
          <View className="flex-row  items-center gap-4">
            <TextField
              text="FIRST NAME"
              icon="person"
              placeholder="e.g Mellow"
              keyboardType="text"
              autoCapitalize="words"
              // width="fit"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextField
              text="LAST NAME"
              icon="person"
              placeholder="e.g Junior"
              keyboardType="text"
              autoCapitalize="words"
              // width="fit"
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
          className="flex-row items-center justify-center gap-1 py-[18px] bg-cobalt rounded-[12px] mt-[28px]"
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
          <Text className="items-center text-gray-600 text-[15px]">
            Already have an account?{" "}
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text className="relative top-1 text-navy underline">Login</Text>
            </TouchableOpacity>
          </Text>
        </View>

        <View className="items-center w-full mt-3 mb-6">
          <Text className="items-center text-gray-600 text-[13px] text-center flex-row gap-2">
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
