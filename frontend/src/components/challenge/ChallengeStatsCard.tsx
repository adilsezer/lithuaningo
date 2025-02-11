import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, ProgressBar, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CustomText from "@components/ui/CustomText";
import { ChallengeStats } from "@src/types";

interface StatItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: number | string;
  label: string;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, color }) => {
  const theme = useTheme();
  return (
    <View style={styles.statItem}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <CustomText
        variant="titleMedium"
        style={[styles.statValue, { color: theme.colors.onBackground }]}
      >
        {value}
      </CustomText>
      <CustomText
        variant="bodySmall"
        style={[styles.statLabel, { color: theme.colors.onSurface }]}
      >
        {label}
      </CustomText>
    </View>
  );
};

interface ChallengeStatsCardProps {
  stats: ChallengeStats;
}

export const ChallengeStatsCard: React.FC<ChallengeStatsCardProps> = ({
  stats,
}) => {
  const theme = useTheme();

  const weeklyProgressPercentage =
    (stats.weeklyProgress / stats.weeklyGoal) * 100;

  return (
    <Card style={[styles.container, { borderColor: theme.colors.primary }]}>
      <Card.Content>
        <View style={styles.statsContainer}>
          <StatItem
            icon="cards"
            value={stats.cardsReviewed}
            label="Cards Reviewed"
            color={theme.colors.primary}
          />
          <StatItem
            icon="star"
            value={stats.cardsMastered}
            label="Cards Mastered"
            color={theme.colors.secondary}
          />
          <StatItem
            icon="fire"
            value={stats.currentStreak}
            label={`Streak${
              stats.longestStreak > stats.currentStreak
                ? ` (Best: ${stats.longestStreak})`
                : ""
            }`}
            color={theme.colors.error}
          />
        </View>

        <View style={styles.weeklyProgress}>
          <View style={styles.weeklyGoalHeader}>
            <CustomText variant="bodyMedium">Weekly Progress</CustomText>
            <CustomText
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {stats.weeklyProgress} / {stats.weeklyGoal} cards
            </CustomText>
          </View>
          <ProgressBar
            progress={stats.weeklyProgress / stats.weeklyGoal}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
        </View>

        {stats.lastActivityTimeAgo && (
          <CustomText
            variant="bodySmall"
            style={[
              styles.lastActivity,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Last activity: {stats.lastActivityTimeAgo}
          </CustomText>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontWeight: "600",
    marginTop: 8,
  },
  statLabel: {
    marginTop: 4,
    textAlign: "center",
  },
  weeklyProgress: {
    marginBottom: 16,
  },
  weeklyGoalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  lastActivity: {
    textAlign: "center",
    fontStyle: "italic",
  },
});
