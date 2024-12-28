import { useThemeStyles } from "@hooks/useThemeStyles";
import React, { useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ThemeContextProps } from "@context/ThemeContext";
import { SectionText } from "@components/typography";

interface ThemeSwitchProps extends Pick<ThemeContextProps, "isDarkMode"> {
  onToggle: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ onToggle, isDarkMode }) => {
  const [animationValue] = useState(new Animated.Value(isDarkMode ? 1 : 0));
  const { colors } = useThemeStyles();

  const handleToggle = () => {
    Animated.timing(animationValue, {
      toValue: isDarkMode ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    onToggle();
  };

  const interpolateBackgroundColor = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary, colors.primary],
  });

  const interpolateCircleColor = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text, colors.text],
  });

  const interpolateBorderColor = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text, colors.text],
  });

  return (
    <TouchableOpacity onPress={handleToggle} style={styles.container}>
      <Animated.View
        style={[
          styles.switchBackground,
          {
            backgroundColor: interpolateBackgroundColor,
            borderColor: interpolateBorderColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.switchCircle,
            { backgroundColor: interpolateCircleColor },
            {
              transform: [
                {
                  translateX: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 20],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
      <SectionText>{isDarkMode ? "Dark Mode" : "Light Mode"}</SectionText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  switchBackground: {
    width: 50,
    height: 25,
    borderRadius: 12.5,
    justifyContent: "center",
    padding: 2,
    borderWidth: 1,
  },
  switchCircle: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
  },
});

export default ThemeSwitch;
