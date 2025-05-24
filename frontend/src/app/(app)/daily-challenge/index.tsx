import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import ChallengeComponent from "@components/ui/ChallengeComponent";
import { ActivityIndicator } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { router, useLocalSearchParams } from "expo-router";
import { useUserData } from "@stores/useUserStore";
import {
  ChallengeQuestionResponse,
  UserChallengeStatsResponse,
} from "@src/types";
import { UserChallengeStatsService } from "@services/data/userChallengeStatsService";
import ChallengeService from "@services/data/challengeService";
import ErrorMessage from "@components/ui/ErrorMessage";
import { useTheme } from "react-native-paper";

/**
 * Daily Challenge Screen - Simplified with direct service calls
 */
export default function DailyChallengeScreen() {
  const userData = useUserData();
  const userId = userData?.id;
  const params = useLocalSearchParams();
  const theme = useTheme();

  // Check if we should generate new questions
  const shouldGenerateQuestions = params.generateQuestions === "true";

  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ChallengeQuestionResponse[]>([]);
  const [stats, setStats] = useState<UserChallengeStatsResponse | null>(null);

  // Challenge state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  // Load data with options to generate questions or not
  const loadData = useCallback(
    async (generateNewQuestions = false) => {
      // Don't load if no userId
      if (!userId) {
        setError("User ID is required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // First load user stats to see if they've done the challenge
        const userStats = await UserChallengeStatsService.getUserChallengeStats(
          userId
        );
        setStats(userStats);

        // Get daily challenge questions
        const challengeQuestions =
          await ChallengeService.getDailyChallengeQuestions();
        setQuestions(challengeQuestions);

        // Set starting position based on progress (if not generating new questions)
        if (!generateNewQuestions && userStats) {
          const answeredCount = userStats.todayTotalAnswers || 0;
          // Start from where the user left off, but don't exceed question count
          const startIndex = Math.min(
            answeredCount,
            challengeQuestions.length - 1
          );
          setCurrentIndex(startIndex);
          setScore(userStats.todayCorrectAnswers || 0);
        } else {
          // Start from beginning if generating new questions
          setCurrentIndex(0);
          setScore(0);
        }

        setError(null);
        setShowCompletionScreen(false);
      } catch (err) {
        console.error("Failed to load challenge data:", err);
        setError(
          typeof err === "string" ? err : "Failed to load challenge data"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // Load data on component mount with the appropriate flag
  useEffect(() => {
    loadData(shouldGenerateQuestions);
  }, [loadData, shouldGenerateQuestions]);

  // Get current question
  const currentQuestion = questions[currentIndex];

  // Handle answer submission - simplified with direct service call
  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!userId || !currentQuestion || isCorrectAnswer !== null) return;

      const isCorrect = answer === currentQuestion.correctAnswer;

      try {
        // Submit directly to the service
        await UserChallengeStatsService.submitChallengeAnswer({
          wasCorrect: isCorrect,
          challengeId: currentQuestion.id,
          userId,
        });

        // Update local state
        setIsCorrectAnswer(isCorrect);
        if (isCorrect) setScore((prev) => prev + 1);
      } catch (err) {
        console.error("Failed to submit answer:", err);
      }
    },
    [userId, currentQuestion, isCorrectAnswer]
  );

  // Move to next question
  const handleNextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsCorrectAnswer(null);
    } else {
      // If it's the last question, show completion screen
      setShowCompletionScreen(true);
    }
  }, [currentIndex, questions.length]);

  // Reset challenge
  const handleRetry = useCallback(async () => {
    try {
      setIsLoading(true);
      await loadData(true);
      setIsCorrectAnswer(null);
      setShowCompletionScreen(false);
    } catch (err) {
      setError("Failed to reload challenge questions");
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <CustomText style={styles.text}>
          Lithuaningo AI is loading your challenge...
        </CustomText>
        <CustomText variant="bodySmall">
          No need to wait—come back to this screen anytime!
        </CustomText>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <ErrorMessage
        title="Something went wrong"
        message={error}
        onRetry={handleRetry}
        onSecondaryAction={() => router.back()}
        secondaryButtonText="Go Back"
        fullScreen={true}
      />
    );
  }

  // Show challenge
  return (
    <View style={styles.container}>
      <ChallengeComponent
        title="Daily Challenge"
        questions={questions}
        currentIndex={currentIndex}
        currentQuestion={currentQuestion}
        loading={isLoading}
        error={error}
        score={score}
        isCorrectAnswer={isCorrectAnswer}
        isCompleted={showCompletionScreen}
        onAnswer={handleAnswer}
        onNextQuestion={handleNextQuestion}
        onRetry={handleRetry}
        onGenerateNew={handleRetry}
        onGoBack={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
  },
});
