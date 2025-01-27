import React, { useState } from "react";
import { View, StyleSheet, Text, Platform, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useTheme } from "react-native-paper";
type DatePickerMode = "date" | "time";

interface CustomDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label: string;
  error?: string;
  mode?: DatePickerMode;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label,
  error,
  mode = "date",
  minimumDate,
  maximumDate,
}) => {
  const theme = useTheme();
  const [show, setShow] = useState(false);

  const formatDate = (date: Date) => {
    switch (mode) {
      case "time":
        return format(date, "HH:mm");
      case "date":
        return format(date, "dd/MM/yyyy");
      default:
        return format(date, "dd/MM/yyyy");
    }
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.onBackground }]}>
        {label}
      </Text>
      <Pressable
        onPress={() => setShow(true)}
        style={[
          styles.input,
          { borderColor: error ? theme.colors.error : theme.colors.primary },
        ]}
      >
        <Text
          style={[
            styles.value,
            {
              color: theme.colors.onBackground,
              textAlign: "center",
              fontSize: 24,
            },
          ]}
        >
          {formatDate(value)}
        </Text>
      </Pressable>
      {(show || Platform.OS === "ios") && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour={true}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          display={Platform.OS === "ios" ? "spinner" : "default"}
        />
      )}
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
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  value: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
