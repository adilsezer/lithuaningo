import React from "react";
import { View } from "react-native";
import CustomText from "@components/ui/CustomText";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";

export default function QuizScreen() {
  return (
    <View>
      <HeaderWithBackButton title="Quiz" />
      <CustomText>Quiz (To be implemented)</CustomText>
    </View>
  );
}
