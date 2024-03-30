import { useThemeStyles } from "@src/hooks/useThemeStyles";
import React from "react";
import { View, Text } from "react-native";

interface ResponseMessageProps {
  message: string;
  type: "success" | "error"; // Add a type prop to determine the message type
}

export const ResponseMessage: React.FC<ResponseMessageProps> = ({
  message,
  type,
}) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  // Determine text color based on message type
  const textColor =
    type === "success" ? globalColors.success : globalColors.error;

  return (
    <View style={globalStyles.viewContainer}>
      <Text style={{ color: textColor }}>{message}</Text>
    </View>
  );
};

export default ResponseMessage;
