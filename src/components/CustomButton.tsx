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
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

interface ButtonProps extends TouchableOpacityProps {
  onPress: () => void; // You might consider accepting a returning Promise here for async onPress
  title: string;
  icon?: ImageSourcePropType; // Optional icon property
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const CustomButton: React.FC<ButtonProps> = ({
  onPress,
  title,
  icon,
  style,
  textStyle,
  disabled,
}) => {
  const { styles: globalStyles } = useThemeStyles();

  // Optionally apply disabled styling
  const buttonStyle = [
    globalStyles.button,
    style,
    disabled ? { opacity: 0.5 } : {}, // Example of disabled style
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
