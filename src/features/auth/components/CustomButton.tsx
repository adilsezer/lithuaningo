import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageSourcePropType,
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

interface ButtonProps {
  onPress: () => void;
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
}) => {
  const { styles: globalStyles } = useThemeStyles();

  return (
    <TouchableOpacity style={[globalStyles.button, style]} onPress={onPress}>
      {icon && <Image style={[globalStyles.icon]} source={icon} />}
      <Text style={[globalStyles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
