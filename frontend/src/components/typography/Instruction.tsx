import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import CustomText from "./CustomText";

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
  return (
    <CustomText
      style={[
        {
          textAlign: "center",
          marginVertical: 10,
          opacity: 0.8,
        },
        style,
      ]}
    >
      {children}
    </CustomText>
  );
};
