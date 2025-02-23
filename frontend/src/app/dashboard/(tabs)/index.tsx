import React, { useEffect } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { router } from "expo-router";
import { AnnouncementsCard } from "@components/dashboard/AnnouncementsCard";
import { DailyChallengeCard } from "@components/dashboard/DailyChallengeCard";
import { useDashboard } from "@hooks/useDashboard";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { useDecks } from "@hooks/useDecks";
import { DeckCard } from "@components/deck/DeckCard";
import { useUserData } from "@stores/useUserStore";
import { useError, useSetError, useIsLoading } from "@stores/useUIStore";
import { useIsAuthenticated } from "@stores/useUserStore";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { useDeckVote } from "@src/hooks/useDeckVote";
import { useUserChallengeStats } from "@hooks/useUserChallengeStats";
import { Deck } from "@src/types";

const TopRatedDeckCard: React.FC<{ deck: Deck | null }> = ({ deck }) => {
  const theme = useTheme();
  const userData = useUserData();
  const isLoading = useIsLoading();
  const { voteDeck, voteCounts } = useDeckVote(deck?.id ?? "");

  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!deck) {
    return (
      <View style={styles.emptyState}>
        <CustomText>No top rated decks this week</CustomText>
      </View>
    );
  }

  const actions = {
    onVote: async (isUpvote: boolean) => {
      if (!userData?.id) return;
      await voteDeck({ deckId: deck.id, userId: userData.id, isUpvote });
    },
    onReport: () => router.push(`/decks/${deck.id}/report`),
    onComment: () => router.push(`/decks/${deck.id}/comments`),
    onQuiz: () => router.push(`/decks/${deck.id}/quiz`),
    onPractice: () => router.push(`/decks/${deck.id}`),
    onEdit: () => router.push(`/decks/${deck.id}/edit`),
  };

  return (
    <DeckCard
      deck={deck}
      rating={
        voteCounts.upvotes / (voteCounts.upvotes + voteCounts.downvotes) || 0
      }
      actions={actions}
    />
  );
};

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const userData = useUserData();
  const error = useError();
  const setError = useSetError();
  const isAuthenticated = useIsAuthenticated();

  const {
    userData: dashboardUser,
    validAnnouncements,
    clearError,
  } = useDashboard();

  const { stats, error: statsError } = useUserChallengeStats();

  const { decks: topRatedDecks = [], fetchDecks } = useDecks({
    userId: userData?.id,
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

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const content = (
    <ScrollView>
      <View style={styles.container}>
        {validAnnouncements?.length > 0 && (
          <AnnouncementsCard
            announcements={validAnnouncements}
            backgroundColor={theme.colors.primary}
          />
        )}

        <CustomText variant="titleLarge" bold>
          Hi, {dashboardUser?.fullName || "there"}!
        </CustomText>

        <DailyChallengeCard
          answeredQuestions={stats?.todayTotalAnswers ?? 0}
          correctAnswers={stats?.todayCorrectAnswers ?? 0}
        />
        <CustomButton
          title="Start Daily Challenge"
          onPress={() => router.push("/dashboard/challenge")}
        />

        <CustomText variant="titleLarge">Top Rated Deck of the Week</CustomText>
        <TopRatedDeckCard
          deck={topRatedDecks.length > 0 ? topRatedDecks[0] : null}
        />
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
