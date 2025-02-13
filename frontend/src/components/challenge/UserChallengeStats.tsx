import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { useUserChallengeStats } from "@src/hooks/useUserChallengeStats";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";

interface UserChallengeStatsProps {
  deckId: string;
  userId?: string;
}

export const UserChallengeStatsView: React.FC<UserChallengeStatsProps> = ({
  deckId,
  userId,
}) => {
  const theme = useTheme();
  const { stats, isLoading } = useUserChallengeStats(userId);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!stats) return null;

  return (
    <View style={localStyles.container}>
      <View style={localStyles.statContainer}>
        <Text
          style={[{ color: theme.colors.onBackground }, localStyles.statValue]}
        >
          {stats.cardsReviewed}
        </Text>
        <Text
          style={[{ color: theme.colors.onSurface }, localStyles.statLabel]}
        >
          Cards Reviewed
        </Text>
      </View>
      <View style={localStyles.statContainer}>
        <Text
          style={[{ color: theme.colors.onBackground }, localStyles.statValue]}
        >
          {stats.cardsMastered}
        </Text>
        <Text
          style={[{ color: theme.colors.onSurface }, localStyles.statLabel]}
        >
          Cards Mastered
        </Text>
      </View>
      <View style={localStyles.statContainer}>
        <Text
          style={[{ color: theme.colors.onBackground }, localStyles.statValue]}
        >
          {stats.currentStreak}
        </Text>
        <Text
          style={[{ color: theme.colors.onSurface }, localStyles.statLabel]}
        >
          Current Streak
        </Text>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  statContainer: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
