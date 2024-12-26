import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";

interface ProgressBarProps {
  progress: number;
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 8 }) => {
  const { colors: globalColors } = useThemeStyles();

  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[
        styles.progressBarContainer,
        { backgroundColor: globalColors.border },
        { height },
      ]}
    >
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
    width: "90%",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 10,
    alignSelf: "center",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
});

export default ProgressBar;
