import React from "react";
import { View } from "react-native";
import CustomText from "@components/ui/CustomText";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";

export default function ChallengeScreen() {
  return (
    <View>
      <HeaderWithBackButton title="Challenge" />
      <CustomText>Challenge (To be implemented)</CustomText>
    </View>
  );
}
