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

  const [placeholderAnim] = useState(new Animated.Value(value ? 1 : 0));

  // Determine if the device is a tablet
  const isTablet =
    (Platform.OS === "ios" && Platform.isPad) || screenWidth >= 768;

  // Determine the default width for iPad
  const defaultWidth = isTablet ? "75%" : "100%";

  const handleFocus = () => {
    Animated.timing(placeholderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!value) {
      Animated.timing(placeholderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const placeholderTranslateY = placeholderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -10],
  });

  const placeholderScale = placeholderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
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
            transform: [
              { translateY: placeholderTranslateY },
              { scale: placeholderScale },
            ],
            color: globalColors.placeholder,
            textAlign: "center",
            paddingBottom: isTablet ? 30 : 20,
            pointerEvents: "none",
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
