import React from "react";
import { View } from "react-native";
import { Slot } from "expo-router";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
export default function AuthLayout() {
  const { styles } = useThemeStyles();
  return (
    <View style={styles.layoutContainer}>
      <Slot />
    </View>
  );
}
