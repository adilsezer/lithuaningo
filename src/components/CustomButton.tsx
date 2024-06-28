import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageSourcePropType,
  View,
  TouchableOpacityProps,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

interface ButtonProps extends TouchableOpacityProps {
  onPress: () => void; // You might consider accepting a returning Promise here for async onPress
  title: string;
  icon?: ImageSourcePropType; // Optional icon property
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
  width, // Add width prop
  disabled,
}) => {
  const { styles: globalStyles } = useThemeStyles();
  const { width: screenWidth } = useWindowDimensions();

  // Determine if the device is a tablet
  const isTablet =
    (Platform.OS === "ios" && Platform.isPad) || screenWidth >= 768;

  // Determine the default width for iPad
  const defaultWidth = isTablet ? "50%" : undefined;

  // Conditionally create a width style object if width or defaultWidth is defined
  const widthStyle: ViewStyle | {} =
    width !== undefined
      ? { width }
      : defaultWidth
      ? { width: defaultWidth }
      : {};

  // Optionally apply disabled styling
  const buttonStyle: StyleProp<ViewStyle> = [
    globalStyles.button,
    style,
    disabled ? { opacity: 0.5 } : {},
    widthStyle, // Spread the widthStyle object if it has been defined
  ];

  return (
    <View style={globalStyles.centerContainer}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        disabled={disabled} // Pass the disabled prop to TouchableOpacity
      >
        {icon && <Image style={[globalStyles.icon]} source={icon} />}
        <Text style={[globalStyles.buttonText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
