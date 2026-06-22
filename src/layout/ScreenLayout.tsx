import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { BlurView } from "expo-blur";

interface ScreenLayoutProps {
  children: any;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ScreenLayout({ children, refreshing, onRefresh }: ScreenLayoutProps) {
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <BlurView intensity={50} tint="light" style={styles.blurContainer} />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 50,
          paddingBottom: 130,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          refreshing !== undefined && onRefresh
            ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            : undefined
        }
      >
        {children}
      </ScrollView>
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
