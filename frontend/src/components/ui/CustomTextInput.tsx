import React from "react";
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";

export interface CustomTextInputProps extends TextInputProps {
  error?: string;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  style,
  error,
  ...props
}) => {
  const { colors } = useThemeStyles();

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.card },
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.placeholder}
        {...props}
      />
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "red",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});

export default CustomTextInput;
