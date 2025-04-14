import React, { useEffect, useState } from "react";
import { ScrollView, Image, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  IconButton,
  useTheme,
} from "react-native-paper";
import { router } from "expo-router";
import CustomText from "@components/ui/CustomText";
import CustomButton from "@components/ui/CustomButton";
import CustomDivider from "@components/ui/CustomDivider";
import Leaderboard from "@components/ui/Leaderboard";
import { UserChallengeStatsCard } from "@components/ui/UserChallengeStatsCard";
import { useLeaderboard } from "@hooks/useLeaderboard";
import { useUserData } from "@stores/useUserStore";
import { useChallengeStats } from "@hooks/useChallengeStats";
import ErrorMessage from "@components/ui/ErrorMessage";

/**
 * Challenge Tab Screen
 */
export default function ChallengeScreen() {
  const userData = useUserData();
  const userId = userData?.id;
  const theme = useTheme();

  // Feature data
  const { entries, fetchLeaderboard } = useLeaderboard();
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    getUserChallengeStats,
  } = useChallengeStats(userId);

  // Load data
  useEffect(() => {
    loadData();
  }, [userId]);

  // Load all needed data
  async function loadData() {
    if (!userId) return;

    try {
      await Promise.all([fetchLeaderboard(), getUserChallengeStats()]);
    } catch (err) {
      console.error("Failed to load challenge data:", err);
    }
  }

  // Start daily challenge
  function startChallenge() {
    router.push("/daily-challenge");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Image
        source={require("assets/images/challenge_screen.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.headerContainer}>
        <CustomText variant="titleLarge">Daily Challenge</CustomText>
        <CustomText>
          Test your Lithuanian skills with daily challenges!
        </CustomText>
      </View>

      {/* Error State */}
      {statsError ? (
        <ErrorMessage
          message={`Unable to load challenge data: ${statsError}`}
          onRetry={loadData}
          buttonText="Try Again"
        />
      ) : statsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <CustomText style={styles.loadingText}>
            Loading challenge data...
          </CustomText>
        </View>
      ) : stats?.hasCompletedTodayChallenge ? (
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <IconButton
              icon="check-circle"
              size={28}
              iconColor={theme.colors.primary}
            />
            <CustomText variant="titleMedium" style={styles.cardTitle}>
              Today's Challenge Completed!
            </CustomText>
            <CustomText style={styles.cardText}>
              Come back tomorrow for a new challenge.
            </CustomText>
          </Card.Content>
        </Card>
      ) : (
        <Card
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Card.Content style={styles.cardContent}>
            <IconButton
              icon="star"
              size={28}
              iconColor={theme.colors.primary}
            />
            <CustomText variant="titleMedium" style={styles.cardTitle}>
              Daily Challenge Available
            </CustomText>
            <CustomButton title="Start Challenge" onPress={startChallenge} />
          </Card.Content>
        </Card>
      )}

      {/* Stats */}
      {stats && !statsError && <UserChallengeStatsCard stats={stats} />}

      {/* Leaderboard */}
      <CustomDivider />
      <CustomText variant="titleMedium" style={styles.sectionTitle}>
        Weekly Leaderboard
      </CustomText>
      <Leaderboard entries={entries} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 200,
    marginVertical: 16,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  card: {
    marginBottom: 16,
    borderWidth: 1,
  },
  cardContent: {
    alignItems: "center",
  },
  cardTitle: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardText: {
    textAlign: "center",
  },
  sectionTitle: {
    marginVertical: 8,
    textAlign: "center",
  },
});
