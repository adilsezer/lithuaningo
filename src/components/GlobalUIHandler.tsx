import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

interface UIState {
  message: string | null;
  messageType: "error" | "success" | "info" | "warning" | null;
  isLoading: boolean;
}

const GlobalUIHandler: React.FC = () => {
  const { message, messageType, isLoading } = useSelector<RootState, UIState>(
    (state) => state.ui
  );
  const { colors } = useThemeStyles();

  const getMessageBackgroundColor = () => {
    switch (messageType) {
      case "error":
        return colors.error;
      case "success":
        return colors.success;
      case "info":
        return colors.info;
      case "warning":
        return colors.warning;
      default:
        return "transparent"; // Neutral color for undefined message types
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.active} />
        </View>
      )}
      {message && (
        <View
          style={[
            styles.messageContainer,
            { backgroundColor: getMessageBackgroundColor() },
          ]}
        >
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000, // Make sure it's above other components
  },
  messageContainer: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Full width
  },
  messageText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  loadingContainer: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.6)", // Semi-transparent background for loading
    width: "100%", // Full width
  },
});

export default GlobalUIHandler;
