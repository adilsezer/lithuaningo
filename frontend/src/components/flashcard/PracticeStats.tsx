import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Card, ProgressBar, Text, useTheme } from "react-native-paper";
import { FontAwesome5 } from "@expo/vector-icons";
import { PracticeStats as IPracticeStats } from "@src/types";
import apiClient from "@services/api/apiClient";
import useUIStore from "@stores/useUIStore";

interface PracticeStatsProps {
  deckId: string;
  userId: string;
}

interface StatItemProps {
  icon: string;
  value: number;
  label: string;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, color }) => {
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
      setLoading(true);
      try {
        const data = await apiClient.getPracticeStats(deckId, userId);
        setStats(data);
      } catch (error) {
        console.error("Error loading practice stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [deckId, userId, setLoading]);

  if (isLoading || !stats) return null;

  const masteryPercentage = Math.round(
    (stats.masteredCards / stats.totalCards) * 100
  );

  return (
    <Card style={[styles.container, { borderColor: theme.colors.primary }]}>
      <Card.Content>
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
        <ProgressBar
          progress={masteryPercentage / 100}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
        <Text style={[styles.progressText, { color: theme.colors.onSurface }]}>
          {masteryPercentage}% Mastered
        </Text>
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
  progressText: {
    fontSize: 14,
    textAlign: "center",
  },
});
