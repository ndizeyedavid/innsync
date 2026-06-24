import { Text, TouchableOpacity, View } from "react-native";
import { useState, useEffect } from "react";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import ScreenLayout from "../layout/ScreenLayout";
import * as Haptics from "expo-haptics";
import {
  setBackupPin,
  getBackupPin,
  hasBackupPin,
  clearBackupPin,
} from "../utils/storage";

type PinMode = "idle" | "set" | "confirm" | "remove";

export default function BackupPinScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<PinMode>("idle");
  const [pinExists, setPinExists] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [storedPin, setStoredPin] = useState("");

  useEffect(() => {
    loadPinState();
  }, []);

  // Auto-advance: set -> confirm when pin reaches 4 digits
  useEffect(() => {
    if (mode !== "set" || pin.length !== 4) return;
    setMode("confirm");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [pin, mode]);

  // Auto-submit: confirm -> save when confirmPin reaches 4 digits
  useEffect(() => {
    if (mode !== "confirm" || confirmPin.length !== 4) return;
    if (pin !== confirmPin) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPin("");
      setConfirmPin("");
      setMode("set");
      return;
    }
    (async () => {
      try {
        await setBackupPin(pin);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPinExists(true);
        setStoredPin(pin);
        setMode("idle");
      } catch {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    })();
  }, [confirmPin, mode]);

  const loadPinState = async () => {
    const exists = await hasBackupPin();
    setPinExists(exists);
    if (exists) {
      const p = await getBackupPin();
      setStoredPin(p || "");
    }
  };

  const handleStartSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin("");
    setConfirmPin("");
    setMode("set");
  };

  const handleStartChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin("");
    setConfirmPin("");
    setMode("set");
  };

  const handleStartRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode("remove");
  };

  const handleConfirmRemove = async () => {
    try {
      await clearBackupPin();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPinExists(false);
      setMode("idle");
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePinSubmit = () => {
    if (mode === "set" && pin.length === 4) {
      setMode("confirm");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (mode === "confirm" && confirmPin.length === 4) {
      if (pin !== confirmPin) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setPin("");
        setConfirmPin("");
        setMode("set");
      } else {
        (async () => {
          try {
            await setBackupPin(pin);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPinExists(true);
            setStoredPin(pin);
            setMode("idle");
          } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        })();
      }
    }
  };

  const renderPinDots = (value: string) => {
    const dots = [];
    for (let i = 0; i < 4; i++) {
      dots.push(
        <View
          key={i}
          className={`size-4 rounded-full mx-2 ${i < value.length ? "bg-navy" : "bg-gray-300"}`}
        />,
      );
    }
    return dots;
  };

  const renderDigitKey = (onPress: (d: string) => void) => {
    const digits = [
      "1", "2", "3",
      "4", "5", "6",
      "7", "8", "9",
      "",  "0", "",
    ];

    return (
      <View className="items-center mt-6">
        {[0, 1, 2, 3].map((rowIdx) => (
          <View key={rowIdx} className="flex-row justify-center gap-4 mb-3">
            {digits.slice(rowIdx * 3, rowIdx * 3 + 3).map((d, di) =>
              d ? (
                <TouchableOpacity
                  key={`${rowIdx}-${di}`}
                  className="size-16 rounded-full bg-sand-100 items-center justify-center active:bg-sand-200"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPress(d);
                  }}
                >
                  <Text className="text-2xl font-semibold text-navy">{d}</Text>
                </TouchableOpacity>
              ) : (
                <View key={`${rowIdx}-${di}`} className="size-16" />
              ),
            )}
          </View>
        ))}
        <TouchableOpacity
          className="mt-2"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress("backspace");
          }}
        >
          <Ionicons name="backspace-outline" size={28} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    );
  };

  const handleDigitPress = (d: string) => {
    if (d === "backspace") {
      if (mode === "set") {
        setPin((prev) => prev.slice(0, -1));
      } else if (mode === "confirm") {
        setConfirmPin((prev) => prev.slice(0, -1));
      }
      return;
    }
    if (mode === "set" && pin.length < 4) {
      setPin(pin + d);
    } else if (mode === "confirm" && confirmPin.length < 4) {
      setConfirmPin(confirmPin + d);
    }
  };

  if (mode === "set" || mode === "confirm") {
    const currentValue = mode === "set" ? pin : confirmPin;
    const label =
      mode === "set" ? "Enter new PIN" : "Confirm your PIN";

    return (
      <ScreenLayout>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (mode === "confirm") {
              setPin("");
              setConfirmPin("");
              setMode("set");
            } else {
              setMode("idle");
            }
          }}
          className="mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="#283D5A" />
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center px-6">
          <View className="size-16 bg-navy rounded-2xl items-center justify-center mb-6">
            <Ionicons name="key-outline" size={32} color="white" />
          </View>
          <Text className="text-2xl font-bold text-navy text-center mb-2">
            {label}
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-8">
            {mode === "confirm"
              ? "Enter the same PIN again to confirm"
              : "Choose a 4-digit backup PIN"}
          </Text>

          <View className="flex-row justify-center mb-8">
            {renderPinDots(currentValue)}
          </View>

          {renderDigitKey(handleDigitPress)}
        </View>

        <View className="px-6 pb-6">
          <TouchableOpacity
            className="bg-navy rounded-2xl py-4 items-center"
            onPress={handlePinSubmit}
            disabled={currentValue.length !== 4}
          >
            <Text className={`text-white font-semibold text-lg ${currentValue.length !== 4 ? "opacity-50" : ""}`}>
              {mode === "confirm" ? "Confirm PIN" : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  if (mode === "remove") {
    return (
      <ScreenLayout>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setMode("idle");
          }}
          className="mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="#283D5A" />
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center px-6">
          <View className="size-20 bg-red-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
          </View>
          <Text className="text-2xl font-bold text-navy text-center mb-2">
            Remove Backup PIN?
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
            You will no longer be able to access your room using a PIN.
            Bluetooth digital key will still work.
          </Text>

          <View className="flex-row gap-4 w-full">
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-2xl py-4 items-center"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMode("idle");
              }}
            >
              <Text className="text-navy font-semibold text-lg">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-error rounded-2xl py-4 items-center"
              onPress={handleConfirmRemove}
            >
              <Text className="text-white font-semibold text-lg">Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenLayout>
    );
  }

  // idle mode
  return (
    <ScreenLayout>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        className="mb-4"
      >
        <Ionicons name="arrow-back" size={24} color="#283D5A" />
      </TouchableOpacity>

      <View className="flex-1 px-2">
        <Text className="text-2xl font-bold text-navy mb-1">Backup PIN</Text>
        <Text className="text-sm text-gray-500 mb-6">
          Use a PIN to unlock your door when Bluetooth is unavailable.
        </Text>

        {pinExists ? (
          <>
            <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
              <Text className="text-xs text-gray-500 mb-2">YOUR BACKUP PIN</Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row">
                  {(showCurrentPin ? storedPin : "****").split("").map((c, i) => (
                    <View
                      key={i}
                      className="size-10 rounded-md bg-sand-100 items-center justify-center mr-2"
                    >
                      <Text className="text-lg font-bold text-navy">{c}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCurrentPin(!showCurrentPin);
                  }}
                >
                  <Ionicons
                    name={showCurrentPin ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className="bg-navy rounded-2xl py-4 items-center mb-3"
              onPress={handleStartChange}
            >
              <Text className="text-white font-semibold text-lg">Change PIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white border border-error rounded-2xl py-4 items-center"
              onPress={handleStartRemove}
            >
              <Text className="text-error font-semibold text-lg">Remove PIN</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="items-center py-12">
            <View className="size-20 bg-sand-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="key-outline" size={40} color="#283D5A" />
            </View>
            <Text className="text-lg font-semibold text-navy mb-2">
              No Backup PIN Set
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
              Set a 4-digit PIN so you can unlock your door even when
              Bluetooth is not working.
            </Text>
            <TouchableOpacity
              className="bg-navy rounded-2xl py-4 px-10 items-center"
              onPress={handleStartSet}
            >
              <Text className="text-white font-semibold text-lg">Set Backup PIN</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}