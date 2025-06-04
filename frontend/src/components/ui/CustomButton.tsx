import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Button } from "react-native-paper";

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  textColor?: string;
  mode?: "text" | "outlined" | "contained" | "contained-tonal" | "elevated";
  loading?: boolean;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title,
  icon,
  style,
  contentStyle,
  textColor,
  mode = "contained",
  loading = false,
  disabled = false,
}) => {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      icon={icon}
      style={[style, { marginVertical: 12, borderRadius: 8 }]}
      loading={loading}
      disabled={disabled}
      contentStyle={[contentStyle, { height: 60 }]}
      textColor={textColor}
    >
      {title}
    </Button>
  );
};

export default CustomButton;
