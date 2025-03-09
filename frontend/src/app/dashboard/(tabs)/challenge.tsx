import React, { useEffect, useState } from "react";
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
import challengeService from "@src/services/data/challengeService";
import { ActivityIndicator, Card } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";

export default function ChallengeScreen() {
  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const userData = useUserData();
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const {
    entries,
    loading,
    error: leaderboardError,
    fetchLeaderboard,
  } = useLeaderboard();
  const {
    stats,
    error,
    isLoading,
    fetchStats,
    createStats,
    checkStatsExistence,
    hasCheckedExistence,
  } = useUserChallengeStats(userData?.id);

  // Check daily challenge status
  const checkDailyChallengeStatus = async () => {
    if (!userData?.id) return;

    try {
      setCheckingStatus(true);
      const isCompleted = await challengeService.hasDailyChallengeCompleted(
        userData.id
      );
      setDailyChallengeCompleted(isCompleted);
    } catch (error) {
      console.error("Error checking daily challenge status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Check status when component mounts
  useEffect(() => {
    checkDailyChallengeStatus();

    // If user is logged in but stats are missing, attempt to fetch them
    if (userData?.id) {
      if (!hasCheckedExistence) {
        checkStatsExistence().then((exists) => {
          if (exists) {
            fetchStats();
          }
        });
      } else if (!stats && !isLoading) {
        fetchStats();
      }
    }
  }, [
    userData?.id,
    fetchStats,
    stats,
    isLoading,
    checkStatsExistence,
    hasCheckedExistence,
  ]);

  // Also check status whenever screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkDailyChallengeStatus();

      // If user is logged in but stats are missing, attempt to fetch them again
      if (userData?.id && !stats && !isLoading && hasCheckedExistence) {
        fetchStats();
      }

      return () => {}; // Cleanup function
    }, [userData?.id, stats, isLoading, fetchStats, hasCheckedExistence])
  );

  React.useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Handle creating stats if they don't exist
  const handleStartChallenge = async () => {
    if (userData?.id && !stats) {
      try {
        // First check if stats exist before trying to create
        const statsExist = await checkStatsExistence();

        if (statsExist) {
          // If stats exist but not loaded, just fetch them
          await fetchStats();
        } else {
          // Create new stats if they don't exist
          await createStats();
        }
      } catch (error) {
        console.error("Error handling challenge stats:", error);
        // Continue to challenge anyway - stats will be handled there if needed
      }
    }
    handleNavigation("/challenge");
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <ScrollView style={styles.container}>
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
        challenge or warm up with flashcards.
      </CustomText>

      {checkingStatus ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <CustomText style={styles.loadingText}>
            Checking challenge status...
          </CustomText>
        </View>
      ) : dailyChallengeCompleted ? (
        <Card style={styles.completedCard}>
          <Card.Content>
            <CustomText variant="titleMedium" style={styles.completedText}>
              You've completed today's challenge!
            </CustomText>
            <CustomText style={styles.completedSubtext}>
              Come back tomorrow for a new challenge.
            </CustomText>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  },
  completedText: {
    textAlign: "center",
    fontWeight: "bold",
  },
  completedSubtext: {
    textAlign: "center",
    marginTop: 8,
  },
});
