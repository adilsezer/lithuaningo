import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles"; // Ensure the path is correct based on your project structure

const LoadingIndicator = () => {
  const { styles, colors } = useThemeStyles(); // Use the custom hook to get styles and colors

  return (
    <View style={styles.viewContainer}>
      <ActivityIndicator size="large" color={colors.loading} />
    </View>
  );
};

export default LoadingIndicator;
