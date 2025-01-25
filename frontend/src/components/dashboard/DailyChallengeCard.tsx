import React from "react";
import { ThemeColors } from "@src/styles/colors";
import { StatsCard } from "@components/ui/StatsCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface DailyChallengeCardProps {
  answeredQuestions: number;
  correctAnswers: number;
  colors: ThemeColors;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  answeredQuestions,
  correctAnswers,
  colors,
}) => {
  const wrongAnswers = answeredQuestions - correctAnswers;

  const stats = [
    {
      label: "Questions\nAnswered",
      value: answeredQuestions,
      icon: "help" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: colors.secondary,
    },
    {
      label: "Correct\nAnswers",
      value: correctAnswers,
      icon: "check" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: colors.primary,
    },
    {
      label: "Wrong\nAnswers",
      value: wrongAnswers,
      icon: "close" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: colors.tertiary,
    },
  ];

  return (
    <StatsCard
      title="Daily Challenge"
      subtitle="Here is your progress for today."
      stats={stats}
      colors={colors}
      progress={answeredQuestions / 10}
      largeStats
    />
  );
};
