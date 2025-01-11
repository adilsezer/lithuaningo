import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { FontAwesome } from "@expo/vector-icons";

interface Option {
  label: string;
  value: string;
}

interface CustomPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  error?: string;
}

export const CustomPicker: React.FC<CustomPickerProps> = ({
  value,
  onValueChange,
  options,
  error,
}) => {
  const { colors } = useThemeStyles();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleValueChange = (newValue: string) => {
    onValueChange(newValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.pickerButton,
          {
            borderColor: error ? colors.error : colors.border,
            backgroundColor: colors.inputBackground,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.valueText, { color: colors.text }]}>
          {selectedOption?.label || "Select an option"}
        </Text>
        <FontAwesome
          name="chevron-down"
          size={14}
          color={colors.text}
          style={styles.icon}
        />
      </Pressable>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Picker
              selectedValue={value}
              onValueChange={handleValueChange}
              style={[styles.picker, { color: colors.text }]}
            >
              {options.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  color={Platform.OS === "ios" ? colors.text : undefined}
                />
              ))}
            </Picker>
          </Pressable>
        </Pressable>
      </Modal>
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    height: 60,
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
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalContent: {
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
