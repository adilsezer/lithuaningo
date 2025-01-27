import React, { useEffect } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { router } from "expo-router";
import { AnnouncementsCard } from "@components/dashboard/AnnouncementsCard";
import { DailyChallengeCard } from "@components/dashboard/DailyChallengeCard";
import { UserStatsCard } from "@components/dashboard/UserStatsCard";
import { useDashboard } from "@hooks/useDashboard";
import { useUserStats } from "@hooks/useUserStats";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { useDecks } from "@hooks/useDecks";
import { DeckCard } from "@components/deck/DeckCard";
import { useUserData } from "@stores/useUserStore";
import { useError, useSetError, useIsLoading } from "@stores/useUIStore";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";

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

  const { stats, error: statsError } = useUserStats();

  const {
    decks: topRatedDecks,
    deckRatings,
    voteDeck,
    fetchDecks,
  } = useDecks(userData?.id, { initialCategory: "Top" });

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
    (deckId: string) => ({
      onVote: (isUpvote: boolean) => voteDeck(deckId, isUpvote),
      onReport: () => router.push(`/decks/${deckId}/report`),
      onComment: () => router.push(`/decks/${deckId}/comments`),
      onQuiz: () => router.push(`/decks/${deckId}/quiz`),
      onPractice: () => router.push(`/decks/${deckId}`),
    }),
    [voteDeck, router]
  );

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          setError(null);
          clearError();
        }}
        fullScreen
      />
    );
  }

  const renderTopRatedDeck = React.useCallback(() => {
    if (topRatedDecks.length === 0) {
      return (
        <View style={styles.emptyState}>
          <CustomText>No top rated decks this week</CustomText>
        </View>
      );
    }

    return (
      <DeckCard
        deck={topRatedDecks[0]}
        rating={deckRatings[topRatedDecks[0].id] || 0}
        actions={handleDeckActions(topRatedDecks[0].id)}
      />
    );
  }, [topRatedDecks, deckRatings, handleDeckActions]);

  return (
    <ScrollView>
      <View style={styles.container}>
        <CustomText variant="titleLarge" bold>
          Hi, {dashboardUser?.name || "there"}!
        </CustomText>

        {stats && <UserStatsCard stats={stats} />}

        {validAnnouncements.length > 0 && (
          <AnnouncementsCard
            announcements={validAnnouncements}
            backgroundColor={theme.colors.secondary}
          />
        )}

        <DailyChallengeCard
          answeredQuestions={stats?.todayAnsweredQuestions ?? 0}
          correctAnswers={stats?.todayCorrectAnsweredQuestions ?? 0}
          colors={theme.colors.secondary}
        />
        <CustomButton
          title="Start Daily Challenge"
          onPress={() => router.push("/dashboard/challenge")}
        />

        <View>
          <CustomText>Top Rated Deck of the Week</CustomText>
          {renderTopRatedDeck()}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    gap: 16,
  },
  emptyState: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DashboardScreen;
