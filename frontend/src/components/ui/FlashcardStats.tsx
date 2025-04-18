import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, useTheme, ProgressBar } from "react-native-paper";
import { UserFlashcardStatResponse } from "@src/types/UserFlashcardStats";
import CustomText from "./CustomText";

interface FlashcardStatsProps {
  stats: UserFlashcardStatResponse | null;
  isLoading: boolean;
}

const FlashcardStats: React.FC<FlashcardStatsProps> = ({
  stats,
  isLoading,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Card
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Card.Content>
          <CustomText>Loading stats...</CustomText>
        </Card.Content>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Card.Content>
          <CustomText>
            You're seeing this flashcard for the first time
          </CustomText>
        </Card.Content>
      </Card>
    );
  }

  const totalAnswers = stats.correctCount + stats.incorrectCount;
  const correctRate = totalAnswers > 0 ? stats.correctCount / totalAnswers : 0;
  const masteryProgress = stats.masteryLevel / 5; // Assuming mastery level is on a scale of 0-5

  return (
    <Card
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Card.Content>
        <CustomText variant="titleMedium" style={styles.title}>
          Stats for this flashcard
        </CustomText>

        <View style={styles.statRow}>
          <CustomText>Times seen:</CustomText>
          <CustomText bold>{stats.viewCount}</CustomText>
        </View>

        <View style={styles.statRow}>
          <CustomText>Correct answers:</CustomText>
          <CustomText bold style={{ color: theme.colors.primary }}>
            {stats.correctCount}
          </CustomText>
        </View>

        <View style={styles.statRow}>
          <CustomText>Incorrect answers:</CustomText>
          <CustomText bold style={{ color: theme.colors.error }}>
            {stats.incorrectCount}
          </CustomText>
        </View>

        <View style={styles.statRow}>
          <CustomText>Last answer:</CustomText>
          {stats.lastAnsweredCorrectly !== undefined ? (
            <CustomText
              bold
              style={{
                color: stats.lastAnsweredCorrectly
                  ? theme.colors.primary
                  : theme.colors.error,
              }}
            >
              {stats.lastAnsweredCorrectly ? "Correct" : "Incorrect"}
            </CustomText>
          ) : (
            <CustomText>None yet</CustomText>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <CustomText>Success rate:</CustomText>
            <CustomText bold>{Math.round(correctRate * 100)}%</CustomText>
          </View>
          <ProgressBar
            progress={correctRate}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <CustomText>Mastery level:</CustomText>
            <CustomText bold>{stats.masteryLevel} / 5</CustomText>
          </View>
          <ProgressBar
            progress={masteryProgress}
            color={theme.colors.secondary}
            style={styles.progressBar}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});

export default FlashcardStats;
