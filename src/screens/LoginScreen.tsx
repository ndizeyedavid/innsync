import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useState } from "react";
import { LoginCredentials } from "../types";
import SocialLoginButton from "../components/SocialLoginButton";

export default function LoginScreen() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const handleLogin = () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    Alert.alert("Success", "Login functionality to be implemented");
  };

  return (
    <View className="flex-1 bg-[#fafaf7] px-5 justify-center">
      <View>
        <Text className="text-[12px] text-[#9C988E]">INNSYNC</Text>
        <Text className="text-[40px] ">Welcome Back.</Text>
        <Text className="text-[#9C988E] text-[14px]">
          Sign in to access your reservation and digital key.
        </Text>
      </View>

      <View className="flex-row justify-between">
        <SocialLoginButton
          buttonLogo={require("../assets/google-logo.png")}
          buttonText="Google"
        />
        <SocialLoginButton
          buttonLogo={require("../assets/apple-logo.png")}
          buttonText="Apple"
        />
      </View>
    </View>
  );
}
