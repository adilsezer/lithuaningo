import React from "react";
import { View, StyleSheet } from "react-native";
import AuthTabs from "../../features/auth/components/AuthTabs"; // Adjust path as needed
import { Slot } from "expo-router";

export default function AuthLayout() {
  return (
    <View style={styles.authLayoutContainer}>
      <View style={styles.flexibleSpace} />
      <AuthTabs />
      <View style={styles.formContainer}>
        <Slot />
      </View>
      <View style={styles.flexibleSpace} />
    </View>
  );
}

const styles = StyleSheet.create({
  authLayoutContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  flexibleSpace: {
    flex: 0.5,
    justifyContent: "flex-end",
  },
  formContainer: {
    flex: 5,
    width: "100%", // Ensure the form takes the full width
    alignItems: "center", // Center align the form for consistent positioning
  },
});
