import React, { useEffect, useState, useCallback, useRef } from "react";
import { ScrollView, Image, StyleSheet, View } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { router } from "expo-router";
import CustomText from "@components/ui/CustomText";
import Leaderboard from "@components/ui/Leaderboard";
import { useLeaderboard } from "@hooks/useLeaderboard";
import { useUserData } from "@stores/useUserStore";
import { UserChallengeStatsCard } from "@components/challenge/UserChallengeStatsCard";
import CustomDivider from "@components/ui/CustomDivider";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { useUserChallengeStats } from "@src/hooks/useUserChallengeStats";
import { useChallenge } from "@src/hooks/useChallenge";
import { ActivityIndicator, Card, useTheme } from "react-native-paper";
import DebugButtons from "@components/debug/DebugButtons";

export default function ChallengeScreen() {
  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const userData = useUserData();
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const loadingRef = useRef(false);
  const theme = useTheme();

  const { checkDailyChallengeStatus, resetDailyChallenge } = useChallenge({
    skipInitialFetch: true,
  });

  const { entries, fetchLeaderboard } = useLeaderboard();

  const { stats, error, fetchStats, createStats } = useUserChallengeStats(
    userData?.id
  );

  // Load data using a ref to prevent duplicate requests
  const loadData = useCallback(async () => {
    if (!userData?.id || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      // Fetch all data in parallel
      const [challengeStatus] = await Promise.all([
        checkDailyChallengeStatus(),
        fetchStats(),
        fetchLeaderboard(),
      ]);

      setDailyChallengeCompleted(challengeStatus);
    } catch (error) {
      console.error("Error loading challenge data:", error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [userData?.id, checkDailyChallengeStatus, fetchStats, fetchLeaderboard]);

  // Single effect to load data when component mounts or user changes
  useEffect(() => {
    if (userData?.id) {
      loadData();
    }
  }, [userData?.id, loadData]);

  const handleStartChallenge = async () => {
    if (userData?.id && !stats) {
      try {
        await createStats();
      } catch (error) {
        console.error("Error creating stats:", error);
      }
    }
    handleNavigation("/challenge");
  };

  const resetDailyChallengeWrapper = async () => {
    if (!userData?.id || !__DEV__) return;

    try {
      await resetDailyChallenge();
      setDailyChallengeCompleted(false);
    } catch (error) {
      console.error("Error resetting daily challenge status:", error);
    }
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Image
        source={require("assets/images/challenge_screen.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <CustomText variant="titleLarge" bold>
        Daily Challenge
      </CustomText>
      <CustomText>
        Ready for today's Lithuaningo challenge? Test your skills with a daily
        challenge or warm up with practice challenges.
      </CustomText>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <CustomText style={styles.loadingText}>
            Loading challenge data...
          </CustomText>
        </View>
      ) : dailyChallengeCompleted ? (
        <Card
          style={[
            styles.completedCard,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Card.Content>
            <CustomText variant="titleMedium" style={styles.completedText}>
              You've completed today's challenge!
            </CustomText>
            <CustomText style={styles.completedSubtext}>
              Come back tomorrow for a new challenge.
            </CustomText>

            <DebugButtons
              actions={[
                {
                  title: "Reset Daily Challenge",
                  onPress: resetDailyChallengeWrapper,
                },
              ]}
            />
          </Card.Content>
        </Card>
      ) : (
        <CustomButton
          title="Start Daily Challenge"
          onPress={handleStartChallenge}
        />
      )}

      {stats && <UserChallengeStatsCard stats={stats} />}

      <CustomDivider />
      <Leaderboard entries={entries} />
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  image: {
    width: "100%",
    height: 300,
    marginVertical: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  completedCard: {
    marginVertical: 16,
    borderWidth: 1,
  },
  completedText: {
    textAlign: "center",
    fontWeight: "bold",
  },
  completedSubtext: {
    textAlign: "center",
    marginTop: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});
