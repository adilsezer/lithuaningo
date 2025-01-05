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
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text,
          },
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
    height: 60,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: "center",
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
