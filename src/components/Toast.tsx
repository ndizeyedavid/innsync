import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { ToastType } from "../contexts/ToastContext";
import Ionicons from "@expo/vector-icons/Ionicons";

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  position: "top" | "bottom";
  onClose: (id: string) => void;
}

const toastColors: Record<ToastType, { bg: string; text: string; icon: string }> = {
  success: { bg: "#10B981", text: "#FFFFFF", icon: "checkmark-circle-outline" },
  error: { bg: "#EF4444", text: "#FFFFFF", icon: "close-circle-outline" },
  info: { bg: "#4AB3DE", text: "#FFFFFF", icon: "information-circle-outline" },
  warn: { bg: "#F59E0B", text: "#FFFFFF", icon: "warning-outline" },
};

export const Toast: React.FC<ToastProps> = ({ id, type, message, position, onClose }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      closeToast();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const closeToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose(id));
  };

  const { bg, text, icon } = toastColors[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          top: position === "top" ? 60 : undefined,
          bottom: position === "bottom" ? 40 : undefined,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Ionicons name={icon} size={24} color={text} style={styles.icon} />
      <Text style={[styles.message, { color: text }]} numberOfLines={3}>
        {message}
      </Text>
      <TouchableOpacity onPress={closeToast} style={styles.closeBtn}>
        <Ionicons name="close" size={20} color={text} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  closeBtn: {
    marginLeft: 12,
    padding: 4,
  },
});
