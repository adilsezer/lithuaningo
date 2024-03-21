import React from "react";
import { Redirect, Slot } from "expo-router";
import { useAuth } from "../../context/AuthContext"; // Adjust the import path as needed
import { ActivityIndicator, View, StyleSheet } from "react-native";

const AppLayout: React.FC = () => {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="auth/login" />;
  }

  return <Slot />;
};

// Styles to center the ActivityIndicator
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppLayout;
