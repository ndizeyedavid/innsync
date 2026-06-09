import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import { useAuth } from "../hooks/useAuth";
import { User } from "../api/types";
import { useToast } from "../contexts/ToastContext";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = async () => {
    // TODO: Implement update user endpoint when available
    // For now, just show a toast
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showToast("success", "Saved! (API not yet implemented)");
    setIsEditing(false);
  };

  return (
    <ScreenLayout>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        className="mb-4"
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <TabHeader alt="PROFILE" title="Personal Information" />

      <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-4">
          <View className="mb-4">
            <Text className="text-xs text-[#A4A097] mb-1">Full Name</Text>
            <TextInput
              className="border border-[#EFEDE7] rounded-xl p-3 text-base"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              editable={isEditing}
            />
          </View>

          <View className="mb-4">
            <Text className="text-xs text-[#A4A097] mb-1">Email</Text>
            <TextInput
              className="border border-[#EFEDE7] rounded-xl p-3 text-base"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              editable={isEditing}
              keyboardType="email-address"
            />
          </View>

          <View className="mb-4">
            <Text className="text-xs text-[#A4A097] mb-1">Phone</Text>
            <TextInput
              className="border border-[#EFEDE7] rounded-xl p-3 text-base"
              placeholder="Enter your phone"
              value={phone}
              onChangeText={setPhone}
              editable={isEditing}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          className="bg-black py-4 rounded-2xl mt-4 items-center"
        >
          <Text className="text-white font-semibold">
            {isEditing ? "Save Changes" : "Edit"}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            onPress={() => {
              if (user) {
                setName(user.name);
                setEmail(user.email);
                setPhone(user.phone || "");
              }
              setIsEditing(false);
            }}
            className="py-3 mt-3 items-center"
          >
            <Text className="text-[#A4A097]">Cancel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
