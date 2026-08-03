import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../../components/TabHeader";
import ScreenLayout from "../../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import usersService from "../../services/users.service";
import { AuthSession } from "../../api/types";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/ToastContext";

export default function LoginHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await usersService.getLoginHistory();
      setSessions(data);
    } catch (error) {
      console.error("Load login history error:", error);
      showToast("error", "Failed to load login history");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevokingId(sessionId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await usersService.revokeSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      showToast("success", "Session revoked successfully");
    } catch (error) {
      console.error("Revoke session error:", error);
      showToast("error", "Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
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

      <TabHeader alt="SECURITY" title="Login History" />

      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <View className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden">
            {sessions.map((session, index) => (
              <View
                key={session.id}
                className={`p-4 border-b border-[#EFEDE7] ${
                  index === sessions.length - 1 ? "border-b-0" : ""
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="size-10 bg-[#F5F4EF] rounded-full items-center justify-center">
                      <Ionicons
                        name={
                          session.deviceLabel
                            ?.toLowerCase()
                            .includes("iphone") ||
                          session.deviceLabel?.toLowerCase().includes("android")
                            ? "phone-portrait-outline"
                            : "desktop-outline"
                        }
                        size={20}
                        color={index === 0 ? "#3F6B4F" : "#9C988E"}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-base font-semibold">
                          {session.deviceLabel || "Unknown Device"}
                        </Text>
                        {index === 0 && (
                          <View className="px-2 py-1 bg-[#F5F4EF] rounded-full">
                            <Text className="text-xs font-semibold text-[#3F6B4F]">
                              Current
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-[#6E6B63] mt-1">
                        {formatDate(session.createdAt)}
                        {session.ip && ` • ${session.ip}`}
                      </Text>
                    </View>
                  </View>

                  {index !== 0 && (
                    <TouchableOpacity
                      onPress={() => handleRevokeSession(session.id)}
                      disabled={revokingId === session.id}
                      className="px-3 py-2"
                    >
                      {revokingId === session.id ? (
                        <ActivityIndicator size="small" color="#DC2626" />
                      ) : (
                        <Ionicons
                          name="log-out-outline"
                          size={20}
                          color="#DC2626"
                        />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {!loading && sessions.length === 0 && (
          <View className="py-20 items-center">
            <Ionicons name="time-outline" size={48} color="#ACA9A0" />
            <Text className="text-[#ACA9A0] text-center mt-4">
              No login history found
            </Text>
          </View>
        )}

        <View className="bg-[#F5F4EF] rounded-2xl p-4 mt-6">
          <Text className="text-base font-semibold mb-2">
            About Login History
          </Text>
          <Text className="text-sm text-[#6E6B63]">
            This shows all devices that are currently logged into your account.
            If you see a device you don't recognize, you can revoke its access
            immediately.
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
