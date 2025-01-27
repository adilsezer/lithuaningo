import React from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import Checkbox from "expo-checkbox";
import { useTheme } from "react-native-paper";
interface CustomCheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  error?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  value,
  onValueChange,
  label,
  error,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.checkboxRow}
        onPress={() => onValueChange(!value)}
      >
        <Checkbox
          value={value}
          onValueChange={onValueChange}
          color={value ? theme.colors.primary : undefined}
          style={styles.checkbox}
        />
        <Text style={[styles.label, { color: theme.colors.onBackground }]}>
          {label}
        </Text>
      </Pressable>
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
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
