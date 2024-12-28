import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";

interface SubtitleProps {
  children?: React.ReactNode;
  contrast?: boolean;
  style?: StyleProp<TextStyle>;
}

export const Subtitle: React.FC<SubtitleProps> = ({
  children,
  contrast,
  style,
}) => {
  const { colors } = useThemeStyles();

  return (
    <Text
      style={[
        {
          fontFamily: "Roboto-Medium",
          fontSize: 18,
          color: contrast ? colors.background : colors.text,
          textAlign: "center",
          marginVertical: 5,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
