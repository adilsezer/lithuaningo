import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";

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
  const { colors } = useThemeStyles();

  return (
    <Text
      style={[
        {
          color: colors.link,
          textDecorationLine: "underline",
          textAlign: "center",
        },
        style,
      ]}
      onPress={onPress}
      {...props}
    >
      {children}
    </Text>
  );
};
