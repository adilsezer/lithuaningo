import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { PracticeStats as IPracticeStats } from "@src/types";
import { SectionTitle } from "@components/typography";
import { FontAwesome5 } from "@expo/vector-icons";
import apiClient from "@services/api/apiClient";

interface PracticeStatsProps {
  deckId: string;
  userId: string;
}

export const PracticeStats: React.FC<PracticeStatsProps> = ({
  deckId,
  userId,
}) => {
  const { colors } = useThemeStyles();
  const [stats, setStats] = useState<IPracticeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [deckId, userId]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getPracticeStats(deckId, userId);
      setStats(data);
    } catch (err) {
      setError("Failed to load practice statistics");
      console.error("Error loading practice stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (error || !stats) {
    return null;
  }

  const masteryPercentage = Math.round(
    (stats.masteredCards / stats.totalCards) * 100
  );

  const recentlyPracticedCards = Object.entries(stats.cardProgress).filter(
    ([_, progress]) => !progress.mastered
  ).length;

  return (
    <View style={styles.container}>
      <SectionTitle style={styles.title}>Practice Statistics</SectionTitle>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <FontAwesome5 name="book" size={20} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats.totalCards}
          </Text>
          <Text style={[styles.statLabel, { color: colors.cardText }]}>
            Total Cards
          </Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="check-circle" size={20} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats.masteredCards}
          </Text>
          <Text style={[styles.statLabel, { color: colors.cardText }]}>
            Mastered
          </Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="sync" size={20} color={colors.error} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats.needsPractice}
          </Text>
          <Text style={[styles.statLabel, { color: colors.cardText }]}>
            Need Practice
          </Text>
        </View>
      </View>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.success,
              width: `${masteryPercentage}%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: colors.cardText }]}>
        {masteryPercentage}% Mastered
      </Text>
      <Text style={[styles.lastPracticed, { color: colors.cardText }]}>
        Last practiced: {new Date(stats.lastPracticed).toLocaleDateString()}
      </Text>
      <Text style={[styles.additionalStats, { color: colors.cardText }]}>
        Recently practiced cards: {recentlyPracticedCards}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  title: {
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: "600",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  lastPracticed: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  additionalStats: {
    fontSize: 12,
    textAlign: "center",
  },
});
