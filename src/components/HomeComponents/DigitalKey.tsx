import { useState, useRef, useEffect, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { GuestStay } from "../../api/types";
import { Svg, Circle, Defs, ClipPath } from "react-native-svg";

interface DigitalKeyProps {
  stay?: GuestStay | null;
  hotelName?: string;
}

// Helper to describe circular progress arc
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function DigitalKey({ stay, hotelName }: DigitalKeyProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const lastHapticRef = useRef(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoLockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // SVG circle configuration
  const size = 160;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const showSuccessAnimation = () => {
    successOpacity.setValue(0);
    glowScale.setValue(0);
    iconRotation.setValue(0);
    iconScale.setValue(1);

    Animated.parallel([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(iconRotation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.3,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const resetAnimations = () => {
    successOpacity.setValue(0);
    glowScale.setValue(0);
    iconRotation.setValue(0);
    iconScale.setValue(1);
    progressAnim.setValue(0);
    setProgress(0);
    progressRef.current = 0;
    setCountdown(5);
  };

  const handleAutoLock = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsLocked(true);
    setIsUnlocked(false);
    resetAnimations();

    Animated.sequence([
      Animated.timing(iconRotation, {
        toValue: -1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleUnlockComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsUnlocked(true);
    setIsLocked(false);
    setIsHolding(false);
    setCountdown(5);
    showSuccessAnimation();

    // Start auto-lock countdown
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    autoLockTimerRef.current = setTimeout(() => {
      handleAutoLock();
    }, 5000);
  }, [handleAutoLock]);

  const handlePressIn = useCallback(() => {
    if (!isLocked) return;

    // Cancel any ongoing auto-lock
    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
      autoLockTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setIsHolding(true);
    buttonScale.setValue(0.95);
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Start very fast progress animation
    let startTime = Date.now();
    const duration = 800; // Very fast unlock
    lastHapticRef.current = 0;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);
      progressRef.current = newProgress;
      progressAnim.setValue(newProgress);

      // Trigger increasing haptic feedback based on progress
      const hapticLevel = Math.floor(newProgress * 6); // 0-5 levels
      if (hapticLevel > lastHapticRef.current) {
        lastHapticRef.current = hapticLevel;
        const intensity = Math.min(hapticLevel / 5, 1);
        Haptics.impactAsync(
          hapticLevel < 3
            ? Haptics.ImpactFeedbackStyle.Light
            : hapticLevel < 5
              ? Haptics.ImpactFeedbackStyle.Medium
              : Haptics.ImpactFeedbackStyle.Heavy,
        );
      }

      if (newProgress < 1) {
        holdTimerRef.current = setTimeout(updateProgress, 8); // Faster updates for smooth progress
      } else {
        handleUnlockComplete();
      }
    };
    updateProgress();
  }, [isLocked, handleUnlockComplete]);

  const handlePressOut = useCallback(() => {
    if (!isLocked) return;

    setIsHolding(false);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    // Reset progress if not complete
    if (progressRef.current < 1) {
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setProgress(0);
      progressRef.current = 0;
    }
  }, [isLocked]);

  const buttonAnimatedStyle = {
    transform: [{ scale: buttonScale }],
  };

  const iconAnimatedStyle = {
    transform: [
      {
        rotate: iconRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"],
        }),
      },
      { scale: iconScale },
    ],
  };

  const successAnimatedStyle = {
    opacity: successOpacity,
  };

  const glowAnimatedStyle = {
    transform: [{ scale: glowScale }],
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View className="flex-1 w-full flex-row justify-between items-start">
        <View>
          <Text className="text-[13px] text-gray-400">DIGITAL KEY</Text>
          <Text className="text-[32px] text-white">
            {stay?.roomPreference || "Room"}
          </Text>
          <Text className="text-[12px] text-gray-400">
            {hotelName || "Hotel"} - until{" "}
            {stay?.checkOut ? formatDate(stay.checkOut) : ""}
          </Text>
        </View>

        <View className="px-[11px] py-[5px] bg-success-light flex-row gap-1 items-center rounded-2xl">
          <View className="size-[6px] bg-success rounded-full" />
          <Text className="text-[13px] text-success">
            {stay?.status === "CHECKED_IN" ? "active" : "inactive"}
          </Text>
        </View>
      </View>

      <View className="relative items-center justify-center">
        {isHolding && isLocked && (
          <View style={styles.progressContainer}>
            <Svg width={size} height={size} style={styles.svg}>
              <Defs>
                <ClipPath id="clip">
                  <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#4AB3DE"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={[circumference, circumference]}
                    strokeDashoffset={progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [circumference, 0],
                    })}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  />
                </ClipPath>
              </Defs>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(74,179,222,0.3)"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#4AB3DE"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={[circumference, circumference]}
                strokeDashoffset={progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [circumference, 0],
                })}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
          </View>
        )}

        {!isLocked && (
          <Animated.View style={[styles.successGlow, glowAnimatedStyle]} />
        )}

        {!isLocked && (
          <Animated.View style={[styles.successBadge, successAnimatedStyle]}>
            <Ionicons name="checkmark" size={24} color="#10B981" />
          </Animated.View>
        )}

        <Animated.View style={[styles.button, buttonAnimatedStyle]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.buttonTouchable}
            onPressIn={isLocked ? handlePressIn : undefined}
            onPressOut={isLocked ? handlePressOut : undefined}
            delayLongPress={0}
          >
            <Animated.View style={iconAnimatedStyle}>
              <Ionicons
                name={isLocked ? "lock-closed" : "lock-open"}
                size={40}
                color="#283D5A"
              />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View>
        {isHolding ? (
          <>
            <Text className="text-[32px] text-white">
              {Math.round(progress * 100)}%
            </Text>
            <Text className="text-[13px] text-gray-400">
              Hold to unlock...
            </Text>
          </>
        ) : !isLocked ? (
          <>
            <Text className="text-[32px] text-white">Unlocked</Text>
            <Text className="text-[13px] text-gray-400">
              Auto-lock in {countdown}s
            </Text>
          </>
        ) : (
          <>
            <Text className="text-[32px] text-white">Hold to unlock</Text>
            <Text className="text-[13px] text-gray-400">
              Press and hold the button
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
    backgroundColor: "#283D5A",
    alignItems: "center",
    borderRadius: 24,
    padding: 20,
  },
  button: {
    width: 137,
    height: 137,
    borderRadius: 68.5,
    zIndex: 10,
  },
  buttonTouchable: {
    width: 137,
    height: 137,
    backgroundColor: "white",
    borderRadius: 68.5,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    position: "absolute",
    zIndex: 1,
  },
  svg: {
    transform: [{ rotate: "-90deg" }],
  },
  successGlow: {
    position: "absolute",
    width: 137,
    height: 137,
    borderRadius: 68.5,
    backgroundColor: "rgba(16, 185, 129, 0.3)",
  },
  successBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 36,
    height: 36,
    backgroundColor: "white",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#10B981",
    zIndex: 20,
  },
});
