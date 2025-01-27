import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { PracticeStats as IPracticeStats } from "@src/types";
import { FontAwesome5 } from "@expo/vector-icons";
import apiClient from "@services/api/apiClient";
import useUIStore from "@stores/useUIStore";
import { useTheme } from "react-native-paper";
interface PracticeStatsProps {
  deckId: string;
  userId: string;
}

const StatItem = ({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) => {
  const theme = useTheme();
  return (
    <View style={styles.statItem}>
      <FontAwesome5 name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color: theme.colors.onBackground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.colors.onSurface }]}>
        {label}
      </Text>
    </View>
  );
};

export const PracticeStats: React.FC<PracticeStatsProps> = ({
  deckId,
  userId,
}) => {
  const theme = useTheme();
  const [stats, setStats] = useState<IPracticeStats | null>(null);
  const { setLoading, isLoading } = useUIStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getPracticeStats(deckId, userId);
        setStats(data);
      } catch (err) {
        console.error("Error loading practice stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [deckId]);

  if (isLoading || !stats) return null;

  const masteryPercentage = Math.round(
    (stats.masteredCards / stats.totalCards) * 100
  );

  const getTimeAgo = (date: string | Date) => {
    try {
      const lastPracticedDate = new Date(date);
      if (isNaN(lastPracticedDate.getTime())) return "Just now";

      const minutes = Math.floor(
        (Date.now() - lastPracticedDate.getTime()) / 60000
      );
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
      if (minutes < 10080) return `${Math.floor(minutes / 1440)}d ago`;

      return lastPracticedDate.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Just now";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <StatItem
          icon="book"
          value={stats.totalCards}
          label="Total Cards"
          color={theme.colors.primary}
        />
        <StatItem
          icon="check-circle"
          value={stats.masteredCards}
          label="Mastered"
          color={theme.colors.primary}
        />
        <StatItem
          icon="sync"
          value={stats.needsPractice}
          label="Need Practice"
          color={theme.colors.error}
        />
      </View>

      <View
        style={[styles.progressBar, { backgroundColor: theme.colors.surface }]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.colors.primary,
              width: `${masteryPercentage}%`,
            },
          ]}
        />
      </View>

      <Text style={[styles.progressText, { color: theme.colors.onSurface }]}>
        {masteryPercentage}% Mastered
      </Text>
      <Text style={[styles.lastPracticed, { color: theme.colors.onSurface }]}>
        Last practiced: {getTimeAgo(stats.lastPracticed)}
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
});
