import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";

interface ButtonTextProps {
  children?: React.ReactNode;
  contrast?: boolean;
  style?: StyleProp<TextStyle>;
}

export const ButtonText: React.FC<ButtonTextProps> = ({
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
