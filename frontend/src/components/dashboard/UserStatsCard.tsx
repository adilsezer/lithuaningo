import React from "react";
import { UserStats } from "@src/types";
import { formatDistanceToNow } from "date-fns";
import { StatsCard } from "@components/ui/StatsCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
interface UserStatsCardProps {
  stats: UserStats;
  backgroundColor?: string;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({
  stats,
  backgroundColor,
}) => {
  const theme = useTheme();
  const lastActive = formatDistanceToNow(new Date(stats.lastActivityTime), {
    addSuffix: true,
  });

  const statsData = [
    {
      label: "Level",
      value: stats.level,
      icon: "star" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: theme.colors.secondary,
    },
    {
      label: "XP",
      value: stats.experiencePoints,
      icon: "lightning-bolt" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: theme.colors.secondary,
    },
    {
      label: "days",
      value: stats.dailyStreak,
      icon: "fire" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: theme.colors.tertiary,
    },
    {
      label: "Words",
      value: stats.totalWordsLearned,
      icon: "book" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: theme.colors.primary,
    },
    {
      label: "Quizzes",
      value: stats.totalQuizzesCompleted,
      icon: "pencil" as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: theme.colors.primary,
    },
  ];

  return (
    <StatsCard
      title="Your Stats"
      subtitle={`Last active: ${lastActive}`}
      stats={statsData}
      largeStats
    />
  );
};
