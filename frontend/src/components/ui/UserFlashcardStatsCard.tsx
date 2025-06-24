import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Card, ProgressBar, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CustomText from "@components/ui/CustomText";
import { UserFlashcardStatsSummaryResponse } from "@src/types/UserFlashcardStats";

interface UserFlashcardStatItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: number | string;
  label: string;
  color: string;
}

const UserFlashcardStatItem: React.FC<UserFlashcardStatItemProps> = ({
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

interface UserFlashcardStatsCardProps {
  stats: UserFlashcardStatsSummaryResponse | null;
  isLoading?: boolean;
}

export const UserFlashcardStatsCard: React.FC<UserFlashcardStatsCardProps> = ({
  stats,
  isLoading = false,
}) => {
  const theme = useTheme();

  const placeholderStats: UserFlashcardStatsSummaryResponse = {
    userId: "",
    totalFlashcards: 0,
    totalViews: 0,
    totalCorrectAnswers: 0,
    totalIncorrectAnswers: 0,
    averageMasteryLevel: 0,
    flashcardsViewedToday: 0,
    successRate: 0,
  };

  const displayData = isLoading ? placeholderStats : stats;

  if (!displayData) {
    return null;
  }

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
            <UserFlashcardStatItem
              icon="cards"
              value={
                displayData.totalCorrectAnswers +
                displayData.totalIncorrectAnswers
              }
              label="Total Cards"
              color={theme.colors.tertiary}
            />
            <UserFlashcardStatItem
              icon="check"
              value={displayData.totalCorrectAnswers}
              label="Correct"
              color={theme.colors.primary}
            />
            <UserFlashcardStatItem
              icon="close"
              value={displayData.totalIncorrectAnswers}
              label="Incorrect"
              color={theme.colors.error}
            />
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <CustomText variant="bodyMedium">Success Rate</CustomText>
              <CustomText
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {displayData.successRate.toFixed(1)}%
              </CustomText>
            </View>
            <ProgressBar
              progress={displayData.successRate / 100}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <CustomText variant="bodyMedium">Mastery Level</CustomText>
              <CustomText
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {displayData.averageMasteryLevel.toFixed(1)}/5.0
              </CustomText>
            </View>
            <ProgressBar
              progress={displayData.averageMasteryLevel / 5}
              color={theme.colors.secondary}
              style={styles.progressBar}
            />
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
    marginHorizontal: 16,
    marginVertical: 8,
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
    marginBottom: 16,
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
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});
