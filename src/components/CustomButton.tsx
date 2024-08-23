import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
  TouchableOpacityProps,
  useWindowDimensions,
  Platform,
  Image,
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

interface ButtonProps extends TouchableOpacityProps {
  onPress: () => void;
  title: string;
  icon?: React.ReactNode; // Update this to React.ReactNode
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  width?: number | string; // Optional width property
}

const CustomButton: React.FC<ButtonProps> = ({
  onPress,
  title,
  icon,
  style,
  textStyle,
  width,
  disabled,
}) => {
  const { styles: globalStyles } = useThemeStyles();
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

  const buttonStyle: StyleProp<ViewStyle> = [
    globalStyles.button,
    style,
    disabled ? { opacity: 0.5 } : {},
    widthStyle,
  ];

  return (
    <View style={globalStyles.centerContainer}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {icon && typeof icon === "number" ? (
            <Image source={icon} style={{ width: 20, height: 20 }} />
          ) : (
            icon
          )}
          <Text
            style={[
              globalStyles.buttonText,
              textStyle,
              { marginLeft: icon ? 8 : 0 },
            ]}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
