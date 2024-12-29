import React from "react";
import { View } from "react-native";
import { SectionText } from "@components/typography";
import { useThemeStyles } from "@hooks/useThemeStyles";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const { colors } = useThemeStyles();
  return (
    <View style={{ padding: 16 }}>
      <SectionText style={{ color: colors.error }}>{message}</SectionText>
    </View>
  );
};

export default ErrorMessage;
