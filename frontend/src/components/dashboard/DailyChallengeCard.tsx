import React from "react";
import { StatsCard } from "@components/ui/StatsCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { View, ActivityIndicator } from "react-native";
import CustomText from "@components/ui/CustomText";

interface DailyChallengeCardProps {
  answeredQuestions: number | undefined;
  correctAnswers: number | undefined;
  isLoading?: boolean;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  answeredQuestions = 0,
  correctAnswers = 0,
  isLoading = false,
}) => {
  const theme = useTheme();

  // Use safe values to prevent NaN
  const safeAnsweredQuestions = answeredQuestions ?? 0;
  const safeCorrectAnswers = correctAnswers ?? 0;
  const wrongAnswers = safeAnsweredQuestions - safeCorrectAnswers;

  const stats = [
    {
      label: "Questions\nAnswered",
      value: safeAnsweredQuestions,
      icon: "help" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: theme.colors.secondary,
    },
    {
      label: "Correct\nAnswers",
      value: safeCorrectAnswers,
      icon: "check" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: theme.colors.primary,
    },
    {
      label: "Wrong\nAnswers",
      value: wrongAnswers,
      icon: "close" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: theme.colors.tertiary,
    },
  ];

  if (isLoading) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <CustomText style={{ marginTop: 10 }}>Loading stats...</CustomText>
      </View>
    );
  }

  return (
    <StatsCard
      title="Daily Challenge"
      subtitle="Here is your progress for today."
      stats={stats}
      progress={safeAnsweredQuestions > 0 ? safeAnsweredQuestions / 10 : 0}
      largeStats
    />
  );
};
