import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Modal,
  Pressable,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";

interface Option {
  label: string;
  value: string;
}

interface CustomPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  error?: string;
  placeholder?: string; // New prop
}

export const CustomPicker: React.FC<CustomPickerProps> = ({
  value,
  onValueChange,
  options,
  error,
  placeholder = "Select an option", // Default placeholder text
}) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleValueChange = (newValue: string) => {
    if (newValue === "") {
      // Handle placeholder selection if needed
      return;
    }
    onValueChange(newValue);
    setModalVisible(false);
  };

  const displayValue = value || placeholder; // Show placeholder if no value is selected

  return (
    <View style={styles.container}>
      {/* The button that toggles the modal */}
      <Pressable
        style={[
          styles.pickerButton,
          {
            borderColor: error ? theme.colors.error : theme.colors.primary,
            backgroundColor: theme.colors.surface,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.valueText,
            {
              color: value
                ? theme.colors.onBackground
                : theme.colors.onSurfaceVariant, // Dim color for placeholder
            },
          ]}
        >
          {displayValue}
        </Text>
        <FontAwesome
          name="chevron-down"
          size={14}
          color={theme.colors.onBackground}
          style={styles.icon}
        />
      </Pressable>

      {/* The modal with bottom‐sheet style */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Overlay to close the modal when tapped outside */}
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        {/* Actual bottom‐sheet content */}
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View
            style={[styles.handle, { backgroundColor: theme.colors.primary }]}
          />
          <Picker
            selectedValue={value}
            onValueChange={handleValueChange}
            style={[styles.picker, { color: theme.colors.onBackground }]}
          >
            {/* Placeholder as the first option */}
            <Picker.Item
              label={placeholder}
              value=""
              color={theme.colors.onSurfaceVariant}
              enabled={false} // Make it unselectable
            />
            {options.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
                color={
                  Platform.OS === "ios" ? theme.colors.onBackground : undefined
                }
              />
            ))}
          </Picker>
        </View>
      </Modal>

      {/* Error message */}
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 12,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueText: {
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  icon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  picker: {
    height: 216,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
