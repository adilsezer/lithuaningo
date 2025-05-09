import React from "react";
import { View, StyleSheet, TextStyle, ViewStyle } from "react-native";
import CustomButton from "./CustomButton";
import CustomText from "@components/ui/CustomText";
import { useTheme } from "react-native-paper";

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
  buttonText = "Retry",
}) => {
  const theme = useTheme();

  return (
    <View>
      <View style={styles.container}>
        <CustomText
          style={[styles.text, { color: theme.colors.error }, textStyle]}
        >
          {message}
        </CustomText>
        {onRetry && <CustomButton title={buttonText} onPress={onRetry} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
});

export default ErrorMessage;
