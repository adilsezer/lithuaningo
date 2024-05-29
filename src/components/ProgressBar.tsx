import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { ThemeColors } from "@src/styles/colors";

interface ProgressBarProps {
  progress: number;
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 8 }) => {
  const { colors: globalColors } = useThemeStyles();

  const widthAnim = useRef(new Animated.Value(0)).current; // Using useRef to persist the Animated.Value

  useEffect(() => {
    // Animate the width change when the progress updates
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false, // 'width' is not supported with native driver
    }).start();
  }, [progress]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"], // Interpolating width from 0 to 100%
  });

  return (
    <View style={[styles.progressBarContainer, { height }]}>
      <Animated.View
        style={[
          styles.progressBar,
          { width: widthInterpolated, backgroundColor: globalColors.secondary },
        ]}
      ></Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
});

export default ProgressBar;
