import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Button, useTheme } from "react-native-paper";

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  mode?: "text" | "outlined" | "contained" | "contained-tonal" | "elevated";
  loading?: boolean;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title,
  icon,
  style,
  mode = "contained",
  loading = false,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <Button
      mode={mode}
      onPress={onPress}
      icon={icon}
      style={[style, { marginVertical: 12 }]}
      loading={loading}
      disabled={disabled}
      contentStyle={{ height: 60 }}
      buttonColor={theme.colors.primary}
    >
      {title}
    </Button>
  );
};

export default CustomButton;
