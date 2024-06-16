// src/components/CompletedScreen.tsx
import React from "react";
import { ScrollView, Text } from "react-native";
import CustomButton from "./CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useRouter } from "expo-router";
import BackButton from "./BackButton";

const CompletedScreen: React.FC = () => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const router = useRouter();

  return (
    <ScrollView>
      <BackButton />
      <Text style={globalStyles.title}>
        You have completed today's session!
      </Text>
      <CustomButton
        title="Go to Leaderboard"
        onPress={() => router.push("/dashboard/leaderboard")}
        style={{
          backgroundColor: globalColors.secondary,
        }}
      />
    </ScrollView>
  );
};

export default CompletedScreen;
