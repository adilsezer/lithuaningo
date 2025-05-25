import React from "react";
import { StyleProp, TextStyle } from "react-native";
import {
  Text as PaperText,
  TextProps as PaperTextProps,
  useTheme,
} from "react-native-paper";

interface CustomTextProps extends PaperTextProps<Text> {
  children: React.ReactNode;
  color?: string;
  bold?: boolean; // New bold prop
  style?: StyleProp<TextStyle>;
}

const CustomText: React.FC<CustomTextProps> = ({
  children,
  color,
  bold = false, // Default bold to false
  style,
  ...props
}) => {
  const theme = useTheme();

  return (
    <PaperText
      {...props}
      style={[
        {
          color: color || theme.colors.onBackground,
          textAlign: "center",
          fontWeight: bold ? "bold" : "normal",
          marginVertical: 6,
        },
        style,
      ]}
    >
      {children}
    </PaperText>
  );
};

export default CustomText;
