import React from "react";
import { UserStats } from "@src/types";
import { formatDistanceToNow } from "date-fns";
import { StatsCard } from "@components/ui/StatsCard";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface UserStatsCardProps {
  stats: UserStats;
  backgroundColor?: string;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({
  stats,
  backgroundColor,
}) => {
  const { colors } = useThemeStyles();
  const lastActive = formatDistanceToNow(new Date(stats.lastActivityTime), {
    addSuffix: true,
  });

  const statsData = [
    {
      label: "Level",
      value: stats.level,
      icon: "star" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: colors.secondary,
    },
    {
      label: "XP",
      value: stats.experiencePoints,
      icon: "lightning-bolt" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: colors.secondary,
    },
    {
      label: "days",
      value: stats.dailyStreak,
      icon: "fire" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: colors.tertiary,
    },
    {
      label: "Words",
      value: stats.totalWordsLearned,
      icon: "book" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: colors.primary,
    },
    {
      label: "Quizzes",
      value: stats.totalQuizzesCompleted,
      icon: "pencil" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: colors.primary,
    },
  ];

  return (
    <StatsCard
      title="Your Stats"
      subtitle={`Last active: ${lastActive}`}
      stats={statsData}
      colors={{
        ...colors,
        card: backgroundColor || colors.card,
      }}
      largeStats
    />
  );
};
