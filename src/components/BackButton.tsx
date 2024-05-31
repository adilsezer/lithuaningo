import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

const BackButton: React.FC = ({}) => {
  const { colors: globalColors } = useThemeStyles();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ alignSelf: "flex-start", margin: 10 }}
    >
      <Ionicons name="arrow-back" size={24} color={globalColors.text} />
    </TouchableOpacity>
  );
};

export default BackButton;
