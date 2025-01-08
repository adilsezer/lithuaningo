import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";

interface SectionTitleProps {
  children?: React.ReactNode;
  contrast?: boolean;
  style?: StyleProp<TextStyle>;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  contrast,
  style,
}) => {
  const { colors } = useThemeStyles();

  return (
    <Text
      style={[
        {
          fontFamily: "Roboto-Bold",
          fontSize: 24,
          color: contrast ? colors.background : colors.text,
          textAlign: "center",
          marginBottom: 8,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
