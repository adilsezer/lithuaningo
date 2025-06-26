import React, { useCallback, useState } from "react";
import { ScrollView, Image, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  IconButton,
  useTheme,
} from "react-native-paper";
import { router, useFocusEffect } from "expo-router";
import CustomText from "@components/ui/CustomText";
import CustomButton from "@components/ui/CustomButton";

import { UserChallengeStatsCard } from "@components/ui/UserChallengeStatsCard";
import CountdownTimer from "@components/ui/CountdownTimer";
import { useUserData } from "@stores/useUserStore";
import { UserChallengeStatsResponse } from "@src/types";
import { UserChallengeStatsService } from "@services/data/userChallengeStatsService";
import { useNextDailyChallengeTimer } from "@hooks/useNextDailyChallengeTimer";

/**
 * Challenge Tab Screen - Using shared hooks for consistency
 */
export default function ChallengeScreen() {
  const userData = useUserData();
  const userId = userData?.id;
  const theme = useTheme();

  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserChallengeStatsResponse | null>(null);

  // Countdown timer for next daily challenge
  const { formattedTime, isNextDay } = useNextDailyChallengeTimer();

  // Load data function - only loads stats, not questions
  const loadData = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load user stats
      const userStats = await UserChallengeStatsService.getUserChallengeStats(
        userId
      );

      // Update state with the data
      setStats(userStats);
    } catch {
      // console.error("Failed to load challenge data:", err);
      setError("Failed to load challenge data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Refresh when screen comes into focus (including initial load)
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        loadData();
      }
      return () => {};
    }, [userId, loadData])
  );

  // Handle start challenge button press - now navigates to a route that will generate questions
  const startChallenge = useCallback(() => {
    // Pass a query parameter to indicate we want to generate new questions
    router.push({
      pathname: "/daily-challenge",
      params: { generateQuestions: "true" },
    });
  }, []);

  // Handle continue challenge button press
  const continueChallenge = useCallback(() => {
    // Just navigate to the challenge screen without generating new questions
    router.push("/daily-challenge");
  }, []);

  // Calculate simple derived values
  const hasStartedChallenge = (stats?.todayTotalAnswers ?? 0) > 0;
  const totalAnswers = stats?.todayTotalAnswers ?? 0;
  // Check how many questions user has answered
  const hasCompletedAllQuestions =
    hasStartedChallenge &&
    (stats?.todayCorrectAnswers ?? 0) + (stats?.todayIncorrectAnswers ?? 0) >=
      10; // Expecting 10 questions from the AI

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Image
        source={require("../../../../assets/images/challenge_screen.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.headerContainer}>
        <CustomText variant="titleLarge">Daily Challenge</CustomText>
        <CustomText>
          Test your Lithuanian skills with daily challenges!
        </CustomText>
      </View>

      {/* Challenge Card */}
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
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator
                animating={true}
                size="large"
                color={theme.colors.primary}
              />
            </View>
          )}
          <View style={{ opacity: isLoading ? 0.4 : 1 }}>
            {error ? (
              <>
                <IconButton
                  icon="alert-circle"
                  size={32}
                  iconColor={theme.colors.error}
                  style={styles.iconButton}
                />
                <CustomText variant="titleMedium" style={styles.cardTitle}>
                  Unable to Load Challenge
                </CustomText>
                <CustomText style={styles.cardText}>{error}</CustomText>
                <CustomButton
                  title="Try Again"
                  onPress={loadData}
                  style={styles.button}
                />
              </>
            ) : hasStartedChallenge ? (
              <>
                <IconButton
                  icon="check-circle"
                  size={32}
                  iconColor={theme.colors.primary}
                  style={styles.iconButton}
                />
                <CustomText variant="titleMedium" style={styles.cardTitle}>
                  {hasCompletedAllQuestions
                    ? "Today's Challenge Completed!"
                    : "Today's Challenge Started"}
                </CustomText>
                <CustomText style={styles.cardText}>
                  {hasCompletedAllQuestions
                    ? "You've completed all available questions. Come back tomorrow for a new challenge!"
                    : totalAnswers > 0
                    ? `You've answered ${totalAnswers} questions so far.`
                    : "You've started today's challenge."}
                </CustomText>
                {!hasCompletedAllQuestions && (
                  <CustomButton
                    title="Continue Challenge"
                    onPress={continueChallenge}
                    style={styles.button}
                  />
                )}
              </>
            ) : (
              <>
                <IconButton
                  icon="star"
                  size={32}
                  iconColor={theme.colors.primary}
                  style={styles.iconButton}
                />
                <CustomText variant="titleMedium" style={styles.cardTitle}>
                  Daily Challenge Available
                </CustomText>
                <CustomText style={styles.cardText}>
                  Start today's challenge to test your knowledge!
                </CustomText>
                <CustomButton
                  title="Start Challenge"
                  onPress={startChallenge}
                  style={styles.button}
                />
              </>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Show countdown timer when challenge is completed */}
      {hasCompletedAllQuestions && (
        <CountdownTimer
          formattedTime={formattedTime}
          title="Next Daily Challenge"
          subtitle="New challenge available in:"
          icon="calendar-clock"
          onRefresh={isNextDay ? loadData : undefined}
        />
      )}

      {/* Stats */}
      {!error && <UserChallengeStatsCard stats={stats} isLoading={isLoading} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {},
  headerContainer: {},
  image: {
    width: "100%",
    height: 200,
    marginVertical: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    zIndex: 1,
    borderRadius: 11,
  },
  card: {
    borderWidth: 1,
    marginTop: 16,
    marginHorizontal: 16,
  },
  cardContent: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconButton: {
    margin: 0,
    marginBottom: 8,
  },
  cardTitle: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardText: {
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
