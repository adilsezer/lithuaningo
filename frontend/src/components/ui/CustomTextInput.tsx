import React, { forwardRef } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { TextInput, HelperText, useTheme } from "react-native-paper";

export interface CustomTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  left?: React.ReactNode;
  right?: React.ReactNode;
  mode?: "flat" | "outlined";
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTextInput = forwardRef<any, CustomTextInputProps>(
  (
    {
      value,
      onChangeText,
      label,
      placeholder,
      error,
      secureTextEntry = false,
      disabled = false,
      multiline = false,
      numberOfLines = 1,
      style,
      left,
      right,
      mode = "outlined",
      keyboardType = "default",
      autoCapitalize = "sentences",
      autoCorrect = true,
    },
    ref
  ) => {
    const theme = useTheme();

    return (
      <>
        <TextInput
          ref={ref}
          label={label}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          mode={mode}
          secureTextEntry={secureTextEntry}
          disabled={disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[{ backgroundColor: theme.colors.background }, style]}
          left={left}
          right={right}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          error={!!error}
        />
        {error && (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        )}
      </>
    );
  }
);

CustomTextInput.displayName = "CustomTextInput";

export default CustomTextInput;
