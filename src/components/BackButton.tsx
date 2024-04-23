import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface BackButtonProps {
  color?: string;
  size?: number;
  style?: object;
}

const BackButton: React.FC<BackButtonProps> = ({
  color = "black",
  size = 24,
  style = {},
}) => {
  const handleBackPress = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      }
    } catch (error) {
      console.error("Failed to navigate back:", error);
    }
  };

  // Check if there's a route to go back to
  const canGoBack = router.canGoBack();

  if (!canGoBack) {
    // If there's no route to go back to, don't render anything
    return null;
  }

  return (
    <TouchableOpacity
      onPress={() => handleBackPress}
      style={{ alignSelf: "flex-start", margin: 10, ...style }}
    >
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
};

export default BackButton;
