import React from "react";
import {
  TextInput,
  StyleProp,
  TextStyle,
  TextInputProps,
  useWindowDimensions,
  Platform,
  View,
  ViewStyle,
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

interface CustomTextInputProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  style,
  containerStyle,
  ...rest
}) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const { width: screenWidth } = useWindowDimensions();

  // Determine if the device is a tablet
  const isTablet =
    (Platform.OS === "ios" && Platform.isPad) || screenWidth >= 768;

  // Determine the default width for iPad
  const defaultWidth = isTablet ? "75%" : "100%";

  return (
    <View
      style={[
        {
          width: defaultWidth,
          alignSelf: "center",
        },
        containerStyle,
      ]}
    >
      <TextInput
        style={[globalStyles.input, style, { width: "100%" }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={globalColors.placeholder}
        {...rest}
      />
    </View>
  );
};

export default CustomTextInput;
