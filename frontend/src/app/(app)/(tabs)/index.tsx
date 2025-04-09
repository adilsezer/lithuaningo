import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useUserData } from "@stores/useUserStore";
import CustomText from "@components/ui/CustomText";
import { useSetError } from "@src/stores/useUIStore";
import { useChallengeWithStats } from "@hooks/useChallengeWithStats";
import { DailyChallengeCard } from "@components/ui/DailyChallengeCard";
import { router } from "expo-router";
import CustomButton from "@components/ui/CustomButton";
import Leaderboard from "@components/ui/Leaderboard";
import { useLeaderboard } from "@src/hooks/useLeaderboard";

export default function HomeScreen() {
  const userData = useUserData();
  const setError = useSetError();

  const { entries, fetchLeaderboard } = useLeaderboard();

  const {
    stats,
    error: statsError,
    getUserChallengeStats,
    isLoading: statsLoading,
  } = useChallengeWithStats(userData?.id);

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
    <ScrollView style={[styles.container]} showsVerticalScrollIndicator={false}>
      <CustomText variant="titleLarge" bold>
        Hi, {userData?.fullName || "there"} 👋
      </CustomText>

      <DailyChallengeCard
        answeredQuestions={stats?.todayTotalAnswers}
        correctAnswers={stats?.todayCorrectAnswers}
        isLoading={statsLoading}
      />

      <CustomText variant="bodyMedium">
        Practice flashcards with our AI assistant.
      </CustomText>
      <CustomButton
        title="Browse Flashcards"
        onPress={() => router.push("(app)/(tabs)/flashcard")}
      />
      <CustomText variant="bodyMedium">
        Join the Daily Challenge and compete on the leaderboard!
      </CustomText>
      <CustomButton
        title="Start Daily Challenge"
        onPress={() => router.push("(app)/(tabs)/challenge")}
      />
      <Leaderboard entries={entries} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
