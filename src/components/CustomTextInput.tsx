import React, { useState } from "react";
import {
  TextInput,
  StyleProp,
  TextStyle,
  TextInputProps,
  useWindowDimensions,
  Platform,
  View,
  ViewStyle,
  Animated,
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

  const [isFocused, setIsFocused] = useState(false);
  const [placeholderAnim] = useState(new Animated.Value(0));

  // Determine if the device is a tablet
  const isTablet =
    (Platform.OS === "ios" && Platform.isPad) || screenWidth >= 768;

  // Determine the default width for iPad
  const defaultWidth = isTablet ? "75%" : "100%";

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(placeholderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(placeholderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const placeholderTranslateY = placeholderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20], // Adjust the output range to control the vertical movement of the placeholder
  });

  const placeholderOpacity = placeholderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0], // Fade out the placeholder when focused
  });

  return (
    <View
      style={[
        {
          width: defaultWidth,
          alignSelf: "center",
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
        },
        containerStyle,
      ]}
    >
      <Animated.Text
        style={[
          globalStyles.bold,
          {
            position: "absolute",
            transform: [{ translateY: placeholderTranslateY }],
            opacity: placeholderOpacity,
            color: globalColors.placeholder,
            textAlign: "center",
          },
        ]}
      >
        {placeholder}
      </Animated.Text>
      <TextInput
        style={[
          globalStyles.input,
          style,
          { width: "100%", textAlign: "center" },
        ]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />
    </View>
  );
};

export default CustomTextInput;
