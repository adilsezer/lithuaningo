import React, { useEffect } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useUserData } from "@stores/useUserStore";
import CustomText from "@components/ui/CustomText";
import { useSetError } from "@src/stores/useUIStore";
import { DailyChallengeCard } from "@components/ui/DailyChallengeCard";
import { router } from "expo-router";
import CustomButton from "@components/ui/CustomButton";
import Leaderboard from "@components/ui/Leaderboard";
import { useLeaderboard } from "@src/hooks/useLeaderboard";
import { useChallengeStats } from "@hooks/useChallengeStats";
import ErrorMessage from "@components/ui/ErrorMessage";
import ReviewRequestCard from "@components/ui/ReviewRequestCard";
import AppFooter from "@components/ui/AppFooter";

export default function HomeScreen() {
  const userData = useUserData();
  const setError = useSetError();

  const { entries, fetchLeaderboard } = useLeaderboard();
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    getUserChallengeStats,
  } = useChallengeStats(userData?.id);

  useEffect(() => {
    if (userData?.id) {
      fetchLeaderboard();
    }
  }, [userData?.id, fetchLeaderboard]);

  // Set global error state when component-specific errors occur
  useEffect(() => {
    if (statsError) {
      setError(statsError);
    }
  }, [statsError, setError]);

  // Fetch stats when the component mounts or when the user ID changes
  useEffect(() => {
    if (userData?.id) {
      getUserChallengeStats();
    }
  }, [userData?.id, getUserChallengeStats]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <CustomText variant="titleLarge" bold>
        Hi, {userData?.fullName || "there"} 👋
      </CustomText>

      <CustomText variant="bodySmall" style={styles.subtitle}>
        Master Lithuanian with AI-powered personalized learning
      </CustomText>

      {statsError ? (
        <ErrorMessage
          message={`Unable to load challenge stats: ${statsError}`}
          onRetry={getUserChallengeStats}
          buttonText="Try Again"
        />
      ) : (
        <DailyChallengeCard
          answeredQuestions={stats?.todayTotalAnswers}
          correctAnswers={stats?.todayCorrectAnswers}
          isLoading={statsLoading}
        />
      )}

      <CustomText variant="titleMedium" bold style={styles.sectionHeader}>
        📚 Flashcards
      </CustomText>
      <CustomText variant="bodyMedium">
        Practice with smart flashcards that get better as you improve.
      </CustomText>
      <CustomButton
        title="Start Studying"
        onPress={() => router.push("(app)/(tabs)/flashcard")}
      />

      <CustomText variant="titleMedium" bold style={styles.sectionHeader}>
        🎯 Daily Challenge
      </CustomText>
      <CustomText variant="bodyMedium">
        Answer fun questions and compete with others! 🏆
      </CustomText>
      <CustomButton
        title="Play Today's Challenge"
        onPress={() => router.push("(app)/(tabs)/challenge")}
      />

      <CustomText variant="titleMedium" bold style={styles.sectionHeader}>
        🏆 This Week's Top Players
      </CustomText>
      <CustomText variant="bodyMedium" style={styles.leaderboardSubtitle}>
        Check out who's doing great this week!
      </CustomText>
      <Leaderboard entries={entries} />

      <ReviewRequestCard style={styles.reviewCard} />

      <AppFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.7,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
  },
  leaderboardSubtitle: {
    marginBottom: 12,
    opacity: 0.8,
  },
  reviewCard: {
    marginTop: 8,
    marginBottom: 16,
  },
});
