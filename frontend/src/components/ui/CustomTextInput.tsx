import React from "react";
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

const CustomTextInput: React.FC<CustomTextInputProps> = ({
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
  autoCapitalize = "none",
  autoCorrect = false,
}) => {
  const theme = useTheme();

  return (
    <>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        label={label}
        placeholder={placeholder}
        error={!!error}
        secureTextEntry={secureTextEntry}
        disabled={disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        mode={mode}
        style={[
          {
            backgroundColor: theme.colors.background,
            marginTop: 12,
          },
          style,
        ]}
        outlineColor={theme.colors.primary}
        left={left}
        right={right}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
      />
      {error && (
        <HelperText
          type="error"
          visible={!!error}
          style={{ marginHorizontal: 16 }}
        >
          {error}
        </HelperText>
      )}
    </>
  );
};

export default CustomTextInput;
