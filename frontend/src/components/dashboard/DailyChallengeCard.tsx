import React from "react";
import { StatsCard } from "@components/ui/StatsCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
interface DailyChallengeCardProps {
  answeredQuestions: number;
  correctAnswers: number;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  answeredQuestions,
  correctAnswers,
}) => {
  const wrongAnswers = answeredQuestions - correctAnswers;
  const theme = useTheme();

  const stats = [
    {
      label: "Questions\nAnswered",
      value: answeredQuestions,
      icon: "help" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: theme.colors.secondary,
    },
    {
      label: "Correct\nAnswers",
      value: correctAnswers,
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

  return (
    <StatsCard
      title="Daily Challenge"
      subtitle="Here is your progress for today."
      stats={stats}
      progress={answeredQuestions / 10}
      largeStats
    />
  );
};
