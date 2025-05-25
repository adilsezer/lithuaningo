import React, { useCallback, useState } from 'react';
import { ScrollView, Image, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Card,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import CustomText from '@components/ui/CustomText';
import CustomButton from '@components/ui/CustomButton';
import CustomDivider from '@components/ui/CustomDivider';
import Leaderboard from '@components/ui/Leaderboard';
import { UserChallengeStatsCard } from '@components/ui/UserChallengeStatsCard';
import { useUserData } from '@stores/useUserStore';
import ErrorMessage from '@components/ui/ErrorMessage';
import {
  LeaderboardEntryResponse,
  UserChallengeStatsResponse,
} from '@src/types';
import { UserChallengeStatsService } from '@services/data/userChallengeStatsService';
import LeaderboardService from '@services/data/leaderboardService';

/**
 * Challenge Tab Screen - Using direct service calls
 */
export default function ChallengeScreen() {
  const userData = useUserData();
  const userId = userData?.id;
  const theme = useTheme();

  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserChallengeStatsResponse | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntryResponse[]>([]);

  // Load data function - only loads stats and leaderboard, not questions
  const loadData = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load only user stats and leaderboard data
      const [userStats, leaderboardEntries] = await Promise.all([
        UserChallengeStatsService.getUserChallengeStats(userId),
        LeaderboardService.getCurrentWeekLeaderboard(),
      ]);

      // Update state with the data
      setStats(userStats);
      setEntries(leaderboardEntries);
    } catch {
      // console.error("Failed to load challenge data:", err);
      setError('Failed to load challenge data. Please try again.');
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
      pathname: '/daily-challenge',
      params: { generateQuestions: 'true' },
    });
  }, []);

  // Handle continue challenge button press
  const continueChallenge = useCallback(() => {
    // Just navigate to the challenge screen without generating new questions
    router.push('/daily-challenge');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Image
        source={require('../../../../assets/images/challenge_screen.png')}
        style={styles.image}
        resizeMode='contain'
      />

      <View style={styles.headerContainer}>
        <CustomText variant='titleLarge'>Daily Challenge</CustomText>
        <CustomText>
          Test your Lithuanian skills with daily challenges!
        </CustomText>
      </View>

      {/* Challenge Card */}
      {error ? (
        <ErrorMessage
          message={`Unable to load challenge data: ${error}`}
          onRetry={loadData}
          buttonText='Try Again'
        />
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <CustomText style={styles.loadingText}>
            Loading challenge data...
          </CustomText>
        </View>
      ) : hasStartedChallenge ? (
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
              icon='check-circle'
              size={28}
              iconColor={theme.colors.primary}
            />
            <CustomText variant='titleMedium' style={styles.cardTitle}>
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
                title='Continue Challenge'
                onPress={continueChallenge}
              />
            )}
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
              icon='star'
              size={28}
              iconColor={theme.colors.primary}
            />
            <CustomText variant='titleMedium' style={styles.cardTitle}>
              Daily Challenge Available
            </CustomText>
            <CustomText style={styles.cardText}>
              Start today's challenge to test your knowledge!
            </CustomText>
            <CustomButton title='Start Challenge' onPress={startChallenge} />
          </Card.Content>
        </Card>
      )}

      {/* Stats */}
      {stats && !error && <UserChallengeStatsCard stats={stats} />}

      {/* Leaderboard */}
      <CustomDivider />
      <CustomText variant='titleMedium' style={styles.sectionTitle}>
        Weekly Leaderboard
      </CustomText>
      <Leaderboard entries={entries} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 16,
  },
  loadingContainer: {
    alignItems: 'center',
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
    alignItems: 'center',
  },
  cardTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    textAlign: 'center',
  },
  sectionTitle: {
    marginVertical: 8,
    textAlign: 'center',
  },
});
