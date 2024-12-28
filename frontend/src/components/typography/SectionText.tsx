import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";

interface SectionTextProps {
  children?: React.ReactNode;
  contrast?: boolean;
  style?: StyleProp<TextStyle>;
}

export const SectionText: React.FC<SectionTextProps> = ({
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
          textAlign: "center",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
