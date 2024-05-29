import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const BackButton: React.FC = ({}) => {
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ alignSelf: "flex-start", margin: 10 }}
    >
      <Ionicons name="arrow-back" size={24} color={"black"} />
    </TouchableOpacity>
  );
};

export default BackButton;
