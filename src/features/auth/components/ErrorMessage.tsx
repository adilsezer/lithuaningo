import { useThemeStyles } from "@src/hooks/useThemeStyles";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const { styles: globalStyles } = useThemeStyles();
  return (
    <View style={globalStyles.viewContainer}>
      <Text>{message}</Text>
    </View>
  );
};

export default ErrorMessage;
