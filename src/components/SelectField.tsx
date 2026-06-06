import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

interface SelectItem {
  label: string;
  value: string;
}

interface ModalSelectFieldProps {
  label: string;
  placeholder?: string;
  items: SelectItem[];
  selectedValue: string | undefined;
  onValueChange: (value: string) => void;
  iconName?: any;
}

export default function SelectField({
  label,
  placeholder = "Select an option...",
  items,
  selectedValue,
  onValueChange,
  iconName = "bed-outline", // Default fallback icon
}: ModalSelectFieldProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Find corresponding label text to display inside the mock input box
  const selectedItem = items?.find((item) => item.value === selectedValue);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Clickable custom text box wrapper */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        style={styles.inputWrapper}
      >
        <Ionicons
          name={iconName}
          size={22}
          color="#000"
          style={styles.leftIcon}
        />

        <Text
          style={[styles.inputText, !selectedItem && styles.placeholderText]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>

        <Ionicons
          name="chevron-down-outline"
          size={18}
          color="#9C988E"
          style={styles.rightChevron}
        />
      </TouchableOpacity>

      {/* Global Selection Bottom Sheet Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Dismiss backdrop trigger click outside area */}
          <TouchableOpacity
            style={styles.dismissBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.bottomSheetContainer}>
            <View style={styles.headerBar}>
              <Text style={styles.headerTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* List options wrapper */}
            <FlatList
              data={items || []}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.value)}
                    style={[
                      styles.itemRow,
                      isSelected && styles.selectedItemRow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        isSelected && styles.selectedItemText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-sharp"
                        size={20}
                        color="#007AFF"
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderWidth: 1,
    borderColor: "#E8E5DD",
    borderRadius: 7,
    backgroundColor: "#ffffff",
    paddingHorizontal: 13,
    position: "relative",
  },
  leftIcon: {
    opacity: 0.5,
    marginRight: 10,
  },
  inputText: {
    fontSize: 15,
    color: "#333333",
    flex: 1,
  },
  placeholderText: {
    color: "#9C988E",
  },
  rightChevron: {
    marginLeft: 10,
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
    maxHeight: "50%", // Keeps layout scrolling safe if room arrays grow long
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
  closeText: {
    color: "#FF3B30",
    fontSize: 15,
  },
  listContent: {
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f9f9f9",
  },
  selectedItemRow: {
    backgroundColor: "#F2F7FF",
  },
  itemText: {
    fontSize: 16,
    color: "#333333",
  },
  selectedItemText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
