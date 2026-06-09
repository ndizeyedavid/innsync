import { Text, TouchableOpacity, View, ScrollView } from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../components/TabHeader";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import { useAuth } from "../hooks/useAuth";

export default function AccountScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const accountOptions = [
    {
      id: "1",
      icon: "person-outline",
      title: "Personal Information",
      description: "Name, email, phone number",
      route: "/personal-info",
    },
    {
      id: "2",
      icon: "lock-closed-outline",
      title: "Security",
      description: "Password, 2FA, login history",
      route: "/security",
    },
    {
      id: "3",
      icon: "notifications-outline",
      title: "Notifications",
      description: "Push notifications, email alerts",
      route: "/notifications",
    },
    {
      id: "4",
      icon: "shield-checkmark-outline",
      title: "Privacy",
      description: "Data sharing, permissions",
      route: "/privacy",
    },
    {
      id: "5",
      icon: "document-text-outline",
      title: "Legal",
      description: "Terms, privacy policy",
      route: "/legal",
    },
  ];

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

      <TabHeader alt="SETTINGS" title="Account" />

      {/* Profile Summary */}
      <View className="bg-white border border-[#EFEDE7] rounded-2xl p-5 mt-4">
        <View className="flex-row items-center gap-4 mb-4">
          <View className="size-16 bg-black rounded-full items-center justify-center">
            <Text className="text-white text-2xl font-bold">
              {user ? getInitials(user.name) : "G"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold">
              {user?.name || "Guest User"}
            </Text>
            <Text className="text-sm text-[#6E6B63]">
              {user?.email || "guest@example.com"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/personal-info");
            }}
          >
            <Ionicons name="create-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View className="bg-[#F5F4EF] rounded-xl p-3">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-[#6E6B63]">Member Since</Text>
            <Text className="text-sm font-semibold">January 2026</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-[#6E6B63]">Total Stays</Text>
            <Text className="text-sm font-semibold">12</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Account Options */}
        <Text className="text-[18px] text-[#ACA9A0] mt-6 mb-3">
          ACCOUNT SETTINGS
        </Text>

        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          {accountOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              className={`p-4 border-b border-[#EFEDE7] ${
                index === accountOptions.length - 1 ? "border-b-0" : ""
              }`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (option.route) {
                  router.push(option.route);
                }
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="size-10 bg-[#F5F4EF] rounded-full items-center justify-center">
                    <Ionicons name={option.icon} size={20} color="black" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold">
                      {option.title}
                    </Text>
                    <Text className="text-sm text-[#6E6B63]">
                      {option.description}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9C988E" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger Zone */}
        <Text className="text-[18px] text-[#ACA9A0] mt-6 mb-3">
          DANGER ZONE
        </Text>

        <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
          <TouchableOpacity
            className="p-4 border-b border-[#EFEDE7]"
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              try {
                await signOut();
                router.replace("/login");
              } catch (error) {
                console.error("Sign out error:", error);
              }
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="size-10 bg-red-100 rounded-full items-center justify-center">
                  <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-red-600">
                    Sign Out
                  </Text>
                  <Text className="text-sm text-red-400">
                    Sign out from all devices
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9C988E" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="size-10 bg-red-100 rounded-full items-center justify-center">
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-red-600">
                    Delete Account
                  </Text>
                  <Text className="text-sm text-red-400">
                    Permanently delete your data
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9C988E" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-xs text-[#9C988E]">Innsync Alpha v0.0.5</Text>
          <Text className="text-xs text-[#9C988E] mt-1">© 2026 Innsync</Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
