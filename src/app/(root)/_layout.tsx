import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Redirect, Slot } from "expo-router";
import { useAuth } from "../../context/AuthContext"; // Adjust the import path as needed

const AppLayout: React.FC = () => {
  const { isLoading: isAuthLoading, session } = useAuth();

  // Render the ActivityIndicator while checking auth or onboarding status
  if (isAuthLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect logic based on session
  if (session) {
    return <Redirect href="dashboard" />;
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
