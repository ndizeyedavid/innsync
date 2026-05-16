import { Stack } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function ScreenLayout({ children }: { children: any }) {
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#fafaf7] pt-[50px]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
