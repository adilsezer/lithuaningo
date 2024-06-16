import React from "react";
import { Slot } from "expo-router";
import BackButton from "@components/BackButton";
import { View } from "react-native";

const QuizLayout: React.FC = () => {
  return (
    <View>
      <BackButton />
      <Slot />
    </View>
  );
};

export default QuizLayout;
