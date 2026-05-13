import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Text,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

interface DatePickerSheetProps {
  label: string;
  placeholder?: string;
  value: Date | null;
  onChangeDate: (date: Date) => void;
  minimumDate?: Date;
}

export default function DatePickerSheet({
  label,
  placeholder = "Select date",
  value,
  onChangeDate,
  minimumDate,
}: DatePickerSheetProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  // Sync internal modal state when open triggers
  useEffect(() => {
    if (showModal) {
      setTempDate(value || new Date());
    }
  }, [showModal, value]);

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (!selectedDate) return;

    if (Platform.OS === "android") {
      setShowModal(false);
      onChangeDate(selectedDate);
    } else {
      setTempDate(selectedDate);
    }
  };

  const handleIosConfirm = () => {
    onChangeDate(tempDate);
    setShowModal(false);
  };

  const formatDateLabel = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={styles.flexOne}>
      <TouchableOpacity onPress={() => setShowModal(true)} activeOpacity={0.9}>
        <View pointerEvents="none" className="relative">
          <TextInput
            style={styles.inputStyle}
            placeholder={placeholder}
            placeholderTextColor="#888"
            value={formatDateLabel(value)}
            editable={false}
          />
          <Ionicons
            name="calendar-outline"
            size={20}
            className="absolute top-3.5 right-2"
          />
        </View>
      </TouchableOpacity>

      <Modal
        transparent
        animationType="slide"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.dismissBackdrop}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          />

          <View style={styles.bottomSheetContainer}>
            <View style={styles.headerBar}>
              <Text style={styles.headerTitle}>Select {label}</Text>
              {Platform.OS === "ios" && (
                <TouchableOpacity onPress={handleIosConfirm}>
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.pickerWrapper}>
              {showModal && (
                <DateTimePicker
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  value={Platform.OS === "ios" ? tempDate : value || new Date()}
                  onChange={handleDateChange}
                  themeVariant="light"
                  minimumDate={minimumDate || new Date()}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
    width: "100%",
  },
  inputStyle: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E2DFD8",
    borderRadius: 18,
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    color: "#333333",
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  dismissBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  confirmText: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  pickerWrapper: {
    justifyContent: "center",
  },
});
