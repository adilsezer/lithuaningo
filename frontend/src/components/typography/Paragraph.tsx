import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";

interface ParagraphProps {
  children?: React.ReactNode;
  contrast?: boolean;
  style?: StyleProp<TextStyle>;
}

export const Paragraph: React.FC<ParagraphProps> = ({
  children,
  contrast,
  style,
}) => {
  const { colors } = useThemeStyles();

  return (
    <Text
      style={[
        {
          fontFamily: "Roboto-Regular",
          fontSize: 16,
          color: contrast ? colors.background : colors.text,
          lineHeight: 24,
          marginVertical: 8,
          textAlign: "justify",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
