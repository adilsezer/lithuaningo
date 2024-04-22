import React, { useState } from "react";
import { View, ActivityIndicator, Modal, StyleSheet } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles"; // Ensure the path is correct based on your project structure

const LoadingIndicator = () => {
  const { colors } = useThemeStyles(); // Use the custom hook to get styles and colors
  const [isVisible, setIsVisible] = useState(true); // Manage visibility with state

  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={isVisible} // Controlled by state
      onRequestClose={() => {
        // Handle the modal close request
        setIsVisible(false);
      }}
    >
      <View style={styles.modalBackground}>
        <ActivityIndicator size="large" color={colors.loading} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background to highlight the loader
  },
});

export default LoadingIndicator;
