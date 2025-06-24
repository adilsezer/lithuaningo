import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Card, ProgressBar, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CustomText from "@components/ui/CustomText";
import { UserChallengeStatsResponse } from "@src/types";

interface UserChallengeStatItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: number | string;
  label: string;
  color: string;
}

const UserChallengeStatItem: React.FC<UserChallengeStatItemProps> = ({
  icon,
  value,
  label,
  color,
}) => {
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

interface UserChallengeStatsCardProps {
  stats: UserChallengeStatsResponse | null;
  isLoading?: boolean;
}

export const UserChallengeStatsCard: React.FC<UserChallengeStatsCardProps> = ({
  stats,
  isLoading = false,
}) => {
  const theme = useTheme();

  const placeholderStats: UserChallengeStatsResponse = {
    currentStreak: 0,
    longestStreak: 0,
    lastChallengeDate: "",
    hasCompletedTodayChallenge: false,
    todayCorrectAnswers: 0,
    todayIncorrectAnswers: 0,
    totalChallengesCompleted: 0,
    totalCorrectAnswers: 0,
    totalIncorrectAnswers: 0,
    todayTotalAnswers: 0,
  };

  const displayData = isLoading ? placeholderStats : stats;

  if (!displayData) {
    return null;
  }

  const accuracy =
    displayData.totalCorrectAnswers + displayData.totalIncorrectAnswers > 0
      ? (displayData.totalCorrectAnswers /
          (displayData.totalCorrectAnswers +
            displayData.totalIncorrectAnswers)) *
        100
      : 0;

  return (
    <Card
      style={[
        styles.container,
        {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <Card.Content>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
            />
          </View>
        )}
        <View style={{ opacity: isLoading ? 0.4 : 1 }}>
          <View style={styles.statsContainer}>
            <UserChallengeStatItem
              icon="fire"
              value={displayData.currentStreak}
              label={`Streak${
                displayData.longestStreak > displayData.currentStreak
                  ? ` (Best: ${displayData.longestStreak})`
                  : ""
              }`}
              color={theme.colors.error}
            />
            <UserChallengeStatItem
              icon="check"
              value={displayData.todayCorrectAnswers}
              label="Today's Correct"
              color={theme.colors.primary}
            />
            <UserChallengeStatItem
              icon="close"
              value={displayData.todayIncorrectAnswers}
              label="Today's Incorrect"
              color={theme.colors.error}
            />
          </View>

          <View style={styles.weeklyProgress}>
            <View style={styles.weeklyGoalHeader}>
              <CustomText variant="bodyMedium">Overall Accuracy</CustomText>
              <CustomText
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {accuracy.toFixed(1)}%
              </CustomText>
            </View>
            <ProgressBar
              progress={accuracy / 100}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.totalStats}>
            <CustomText
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Total Challenges: {displayData.totalChallengesCompleted}
            </CustomText>
            <CustomText
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Total Correct: {displayData.totalCorrectAnswers}
            </CustomText>
            <CustomText
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Total Incorrect: {displayData.totalIncorrectAnswers}
            </CustomText>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    marginHorizontal: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    zIndex: 1,
    borderRadius: 11,
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
  totalStats: {
    marginTop: 16,
    gap: 4,
  },
});
