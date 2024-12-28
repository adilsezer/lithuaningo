import React from "react";
import {
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
  TouchableOpacityProps,
  useWindowDimensions,
  Platform,
  Image,
} from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { ButtonText } from "@components/typography";

interface ButtonProps extends TouchableOpacityProps {
  onPress: () => void;
  title: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  width?: number | string;
  variant?: "primary" | "secondary";
}

const CustomButton: React.FC<ButtonProps> = ({
  onPress,
  title,
  icon,
  style,
  textStyle,
  width,
  disabled,
  variant = "primary",
}) => {
  const { components, layout, colors } = useThemeStyles();
  const { width: screenWidth } = useWindowDimensions();

  const isTablet =
    (Platform.OS === "ios" && Platform.isPad) || screenWidth >= 768;
  const defaultWidth = isTablet ? "50%" : undefined;

  const widthStyle: ViewStyle | {} =
    width !== undefined
      ? { width }
      : defaultWidth
      ? { width: defaultWidth }
      : {};

  return (
    <View style={layout.center}>
      <TouchableOpacity
        style={[
          components.button,
          variant === "secondary" && {
            backgroundColor: colors.secondary,
          },
          disabled && { opacity: 0.5 },
          widthStyle,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {icon && typeof icon === "number" ? (
            <Image source={icon} style={{ width: 20, height: 20 }} />
          ) : (
            icon
          )}
          <ButtonText style={[textStyle, { marginLeft: icon ? 8 : 0 }]}>
            {title}
          </ButtonText>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
