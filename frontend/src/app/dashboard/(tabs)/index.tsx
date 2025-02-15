import React, { useEffect } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { router } from "expo-router";
import { AnnouncementsCard } from "@components/dashboard/AnnouncementsCard";
import { DailyChallengeCard } from "@components/dashboard/DailyChallengeCard";
import { UserStatsCard } from "@components/dashboard/UserStatsCard";
import { useDashboard } from "@hooks/useDashboard";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { useDecks } from "@hooks/useDecks";
import { DeckCard } from "@components/deck/DeckCard";
import { useUserData } from "@stores/useUserStore";
import { useError, useSetError, useIsLoading } from "@stores/useUIStore";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { useDeckVote } from "@src/hooks/useDeckVote";
import { useUserChallengeStats } from "@hooks/useUserChallengeStats";

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const userData = useUserData();
  const error = useError();
  const setError = useSetError();
  const isLoading = useIsLoading();

  const {
    userData: dashboardUser,
    validAnnouncements,
    clearError,
  } = useDashboard();

  const { stats, error: statsError } = useUserChallengeStats();

  const { decks: topRatedDecks = [], fetchDecks } = useDecks(userData?.id, {
    initialCategory: "Top Rated",
  });

  // Set global error state when component-specific errors occur
  useEffect(() => {
    if (statsError) {
      setError(statsError);
    }
  }, [statsError, setError]);

  React.useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleDeckActions = React.useCallback(
    (deckId: string) => {
      const { voteDeck } = useDeckVote(deckId);
      return {
        onVote: async (isUpvote: boolean) => {
          if (!userData?.id) return;
          await voteDeck({ deckId, userId: userData.id, isUpvote });
        },
        onReport: () => router.push(`/decks/${deckId}/report`),
        onComment: () => router.push(`/decks/${deckId}/comments`),
        onQuiz: () => router.push(`/decks/${deckId}/quiz`),
        onPractice: () => router.push(`/decks/${deckId}`),
        onEdit: () => router.push(`/decks/${deckId}/edit`),
      };
    },
    [userData?.id]
  );

  const renderTopRatedDeck = React.useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    const hasTopRatedDecks =
      Array.isArray(topRatedDecks) && topRatedDecks.length > 0;
    const topDeck = hasTopRatedDecks ? topRatedDecks[0] : null;

    if (!hasTopRatedDecks || !topDeck) {
      return (
        <View style={styles.emptyState}>
          <CustomText>No top rated decks this week</CustomText>
        </View>
      );
    }

    const { voteCounts } = useDeckVote(topDeck.id);
    return (
      <DeckCard
        deck={topDeck}
        rating={
          voteCounts.upvotes / (voteCounts.upvotes + voteCounts.downvotes) || 0
        }
        actions={handleDeckActions(topDeck.id)}
      />
    );
  }, [topRatedDecks, handleDeckActions, isLoading, theme.colors.primary]);

  const content = (
    <ScrollView>
      <View style={styles.container}>
        {validAnnouncements?.length > 0 && (
          <AnnouncementsCard
            announcements={validAnnouncements}
            backgroundColor={theme.colors.secondary}
          />
        )}

        <CustomText variant="titleLarge" bold>
          Hi, {dashboardUser?.fullName || "there"}!
        </CustomText>

        {stats && <UserStatsCard stats={stats} />}

        <DailyChallengeCard
          answeredQuestions={stats?.todayTotalAnswers ?? 0}
          correctAnswers={stats?.todayCorrectAnswers ?? 0}
        />
        <CustomButton
          title="Start Daily Challenge"
          onPress={() => router.push("/dashboard/challenge")}
        />

        <CustomText variant="titleLarge">Top Rated Deck of the Week</CustomText>
        {renderTopRatedDeck()}
        <CustomButton
          title="View All Decks"
          onPress={() => router.push("/dashboard/decks")}
        />
      </View>
    </ScrollView>
  );

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          setError(null);
          clearError();
          fetchDecks();
        }}
        fullScreen
      />
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  emptyState: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DashboardScreen;
