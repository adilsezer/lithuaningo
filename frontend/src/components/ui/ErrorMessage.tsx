import React from "react";
import { View, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { SectionText } from "@components/typography";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "./CustomButton";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  fullScreen?: boolean;
  buttonText?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  textStyle,
  containerStyle,
  fullScreen,
  buttonText = "Retry",
}) => {
  const { colors } = useThemeStyles();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        containerStyle,
      ]}
    >
      <SectionText style={[styles.text, { color: colors.error }, textStyle]}>
        {message}
      </SectionText>
      {onRetry && (
        <CustomButton
          title={buttonText}
          onPress={onRetry}
          style={[styles.button, { backgroundColor: colors.primary }]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  fullScreen: {
    flex: 1,
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
});

export default ErrorMessage;
