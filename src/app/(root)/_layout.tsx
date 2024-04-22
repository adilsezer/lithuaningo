import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect, Slot } from "expo-router";
import { useAppSelector } from "../../store/hooks"; // Adjust the import path as needed

const AppLayout: React.FC = () => {
  // Use Redux hooks to get auth state
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const isLoading = useAppSelector((state) => state.user.isLoading); // Assuming isLoading is part of your Redux state

  // Render the ActivityIndicator while checking auth or onboarding status
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect logic based on session
  if (isLoggedIn) {
    return <Redirect href="/dashboard" />; // Ensure paths are correctly prefixed with '/'
  }

  return <Slot />;
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppLayout;
