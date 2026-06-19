import { Stack } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  SafeAreaView,
} from "react-native";
import { BlurView } from "expo-blur";

export default function ScreenLayout({ children }: { children: any }) {
  return (
    // <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf7" }}>
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Fixed Top Blur */}
      <BlurView intensity={50} tint="light" style={styles.blurContainer} />

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 50, // Match blur height
        }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {/* </SafeAreaView> */}
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
