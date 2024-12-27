import { useThemeStyles } from "@hooks/useThemeStyles";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ThemeContextProps } from "@context/ThemeContext";

interface ThemeSwitchProps extends Pick<ThemeContextProps, "isDarkMode"> {
  onToggle: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ onToggle, isDarkMode }) => {
  const [animationValue] = useState(new Animated.Value(isDarkMode ? 1 : 0));
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

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
    outputRange: [globalColors.primary, globalColors.primary],
  });

  const interpolateCircleColor = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [globalColors.text, globalColors.text],
  });

  const interpolateBorderColor = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [globalColors.text, globalColors.text],
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
      <Text style={globalStyles.text}>
        {isDarkMode ? "Dark Mode" : "Light Mode"}
      </Text>
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
