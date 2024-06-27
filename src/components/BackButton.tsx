import React from "react";
import { TouchableOpacity, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

const { width } = Dimensions.get("window");

const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

const BackButton: React.FC = () => {
  const { colors: globalColors } = useThemeStyles();
  const iconSize = isTablet ? 36 : 24;

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ alignSelf: "flex-start", margin: 10 }}
    >
      <Ionicons name="arrow-back" size={iconSize} color={globalColors.text} />
    </TouchableOpacity>
  );
};

export default BackButton;
