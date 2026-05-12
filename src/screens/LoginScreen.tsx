import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { LoginCredentials } from "../types";

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
    <View className="flex-1 bg-white px-6 justify-center">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-800 mb-2">
          Welcome Back
        </Text>
        <Text className="text-gray-600">Sign in to continue to InnSync</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-gray-700 mb-2 font-medium">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="Enter your email"
            value={credentials.email}
            onChangeText={(text) =>
              setCredentials({ ...credentials, email: text })
            }
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-2 font-medium">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="Enter your password"
            value={credentials.password}
            onChangeText={(text) =>
              setCredentials({ ...credentials, password: text })
            }
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-3 items-center"
          onPress={handleLogin}
        >
          <Text className="text-white font-semibold text-lg">Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center mt-4">
          <Text className="text-blue-600">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-8">
        <Text className="text-gray-600">Don't have an account? </Text>
        <TouchableOpacity>
          <Text className="text-blue-600 font-medium">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
