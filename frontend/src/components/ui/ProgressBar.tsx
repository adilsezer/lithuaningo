import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
interface ProgressBarProps {
  progress: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  style,
}) => {
  const theme = useTheme();

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
        { backgroundColor: theme.colors.primary },
        { height },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.progressBar,
          { width: widthInterpolated, backgroundColor: theme.colors.secondary },
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
