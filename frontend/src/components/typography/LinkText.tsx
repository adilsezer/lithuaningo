import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import CustomText from "./CustomText";

interface LinkTextProps {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  onPress?: () => void;
}

export const LinkText: React.FC<LinkTextProps> = ({
  children,
  style,
  onPress,
  ...props
}) => {
  return (
    <CustomText
      style={[
        {
          textDecorationLine: "underline",
          textAlign: "center",
        },
        style,
      ]}
      onPress={onPress}
      {...props}
    >
      {children}
    </CustomText>
  );
};
