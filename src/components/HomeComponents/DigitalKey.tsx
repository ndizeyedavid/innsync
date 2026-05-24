import { useState, useRef } from "react";
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

export default function DigitalKey() {
  const [isLocked, setIsLocked] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const ringScale1 = useRef(new Animated.Value(0)).current;
  const ringScale2 = useRef(new Animated.Value(0)).current;
  const ringScale3 = useRef(new Animated.Value(0)).current;
  const ringOpacity1 = useRef(new Animated.Value(0)).current;
  const ringOpacity2 = useRef(new Animated.Value(0)).current;
  const ringOpacity3 = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0)).current;

  let scanningAnimation1: Animated.CompositeAnimation | null = null;
  let scanningAnimation2: Animated.CompositeAnimation | null = null;
  let scanningAnimation3: Animated.CompositeAnimation | null = null;

  const startScanningAnimation = () => {
    // Reset all rings
    ringScale1.setValue(0);
    ringScale2.setValue(0);
    ringScale3.setValue(0);
    ringOpacity1.setValue(0);
    ringOpacity2.setValue(0);
    ringOpacity3.setValue(0);

    // Ring 1 - First wave
    scanningAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale1, {
            toValue: 2.5,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity1, {
            toValue: 0,
            duration: 800,
            delay: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(ringScale1, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    );
    scanningAnimation1.start();

    // Ring 2 - Second wave (delayed)
    setTimeout(() => {
      scanningAnimation2 = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringScale2, {
              toValue: 2.5,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity2, {
              toValue: 0,
              duration: 800,
              delay: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(ringScale2, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      );
      scanningAnimation2.start();
    }, 400);

    // Ring 3 - Third wave (delayed more)
    setTimeout(() => {
      scanningAnimation3 = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringScale3, {
              toValue: 2.5,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity3, {
              toValue: 0,
              duration: 800,
              delay: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(ringScale3, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      );
      scanningAnimation3.start();
    }, 800);
  };

  const stopScanningAnimation = () => {
    if (scanningAnimation1) scanningAnimation1.stop();
    if (scanningAnimation2) scanningAnimation2.stop();
    if (scanningAnimation3) scanningAnimation3.stop();

    ringScale1.stopAnimation();
    ringScale2.stopAnimation();
    ringScale3.stopAnimation();
    ringOpacity1.stopAnimation();
    ringOpacity2.stopAnimation();
    ringOpacity3.stopAnimation();

    ringScale1.setValue(0);
    ringScale2.setValue(0);
    ringScale3.setValue(0);
    ringOpacity1.setValue(0);
    ringOpacity2.setValue(0);
    ringOpacity3.setValue(0);
  };

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
    stopScanningAnimation();
    successOpacity.setValue(0);
    glowScale.setValue(0);
    iconRotation.setValue(0);
    iconScale.setValue(1);
  };

  const handleUnlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (isLocked) {
      setIsScanning(true);
      buttonScale.setValue(0.9);

      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();

      startScanningAnimation();

      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsScanning(false);
        setIsUnlocked(true);
        setIsLocked(false);
        showSuccessAnimation();
      }, 2000);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    }
  };

  const ringAnimatedStyle1 = {
    transform: [{ scale: ringScale1 }],
    opacity: ringOpacity1,
  };

  const ringAnimatedStyle2 = {
    transform: [{ scale: ringScale2 }],
    opacity: ringOpacity2,
  };

  const ringAnimatedStyle3 = {
    transform: [{ scale: ringScale3 }],
    opacity: ringOpacity3,
  };

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

  return (
    <View style={styles.container}>
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-[13px] text-[#989896]">DIGITAL KEY</Text>
          <Text className="text-[32px] text-white">Suite 1207</Text>
          <Text className="text-[12px] text-[#989896]">
            Sereno Bay Resort - until April 30
          </Text>
        </View>

        <View className="px-[11px] py-[5px] bg-[#D9D9D9] flex-row gap-1 items-center rounded-2xl">
          <View className="size-[6px] bg-[#3F6B4F] rounded-full" />
          <Text className="text-[13px] text-[#3F6B4F]">active</Text>
        </View>
      </View>

      <View className="relative items-center justify-center">
        {isScanning && (
          <>
            <Animated.View
              style={[styles.ring, styles.ring1, ringAnimatedStyle1]}
            />
            <Animated.View
              style={[styles.ring, styles.ring2, ringAnimatedStyle2]}
            />
            <Animated.View
              style={[styles.ring, styles.ring3, ringAnimatedStyle3]}
            />
          </>
        )}

        {!isLocked && (
          <Animated.View style={[styles.successGlow, glowAnimatedStyle]} />
        )}

        {!isLocked && (
          <Animated.View style={[styles.successBadge, successAnimatedStyle]}>
            <Ionicons name="checkmark" size={24} color="#3F6B4F" />
          </Animated.View>
        )}

        <Animated.View style={[styles.button, buttonAnimatedStyle]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.buttonTouchable}
            onPress={handleUnlock}
          >
            <Animated.View style={iconAnimatedStyle}>
              <Ionicons
                name={isLocked ? "lock-closed" : "lock-open"}
                size={40}
                color="black"
              />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View>
        {isScanning ? (
          <>
            <Text className="text-[32px] text-white">Scanning...</Text>
            <Text className="text-[13px] text-[#959592]">
              Connecting to door lock
            </Text>
          </>
        ) : !isLocked ? (
          <>
            <Text className="text-[32px] text-white">Unlocked</Text>
            <Text className="text-[13px] text-[#959592]">Tap to lock door</Text>
          </>
        ) : (
          <>
            <Text className="text-[32px] text-white">Tap to unlock</Text>
            <Text className="text-[13px] text-[#959592]">
              Hold near the door for 1 second
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    backgroundColor: "black",
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
  ring: {
    position: "absolute",
    borderRadius: 100,
    borderWidth: 4,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  ring1: {
    width: 137,
    height: 137,
    borderColor: "#00ffff",
    shadowColor: "#00ffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  ring2: {
    width: 137,
    height: 137,
    borderColor: "#00ccff",
    shadowColor: "#00ccff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
  ring3: {
    width: 137,
    height: 137,
    borderColor: "#0099ff",
    shadowRadius: 12,
  },
  successGlow: {
    position: "absolute",
    width: 137,
    height: 137,
    borderRadius: 68.5,
    backgroundColor: "rgba(63, 107, 79, 0.3)",
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
    borderColor: "#3F6B4F",
    zIndex: 20,
  },
});
