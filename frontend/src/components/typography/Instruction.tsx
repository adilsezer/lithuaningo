import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";

interface InstructionProps {
  children?: React.ReactNode;
  contrast?: boolean;
  style?: StyleProp<TextStyle>;
}

export const Instruction: React.FC<InstructionProps> = ({
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
          fontSize: 14,
          color: contrast ? colors.background : colors.text,
          textAlign: "center",
          marginVertical: 10,
          opacity: 0.8,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
