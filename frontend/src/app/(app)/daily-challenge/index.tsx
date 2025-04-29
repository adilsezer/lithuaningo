import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import ChallengeComponent from "@components/ui/ChallengeComponent";
import { Card, ActivityIndicator } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { router, useLocalSearchParams } from "expo-router";
import { useUserData } from "@stores/useUserStore";
import {
  ChallengeQuestionResponse,
  UserChallengeStatsResponse,
} from "@src/types";
import { UserChallengeStatsService } from "@services/data/userChallengeStatsService";
import ChallengeService from "@services/data/challengeService";
import CustomButton from "@components/ui/CustomButton";

/**
 * Daily Challenge Screen - Simplified with direct service calls
 */
export default function DailyChallengeScreen() {
  const userData = useUserData();
  const userId = userData?.id;
  const params = useLocalSearchParams();

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

        // Check if questions already exist for today
        let challengeQuestions: ChallengeQuestionResponse[] = [];

        // If generating new questions or if we don't have existing questions
        // Note: This will make a call to get any existing questions in the backend
        challengeQuestions =
          await ChallengeService.getDailyChallengeQuestions();

        // Log question count
        console.log(
          `[DailyChallenge] Loaded ${challengeQuestions.length} questions`
        );

        // Set questions in state
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

        // Update local state after a slight delay
        setTimeout(() => {
          setIsCorrectAnswer(isCorrect);
          if (isCorrect) setScore((prev) => prev + 1);
        }, 100);
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
      // Load data with flag to start from the beginning
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
        <ActivityIndicator size="large" color="#6200ee" />
        <CustomText style={styles.text}>Loading challenge...</CustomText>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Card>
          <Card.Content>
            <CustomText variant="titleLarge" style={styles.title}>
              Something went wrong
            </CustomText>
            <CustomText style={styles.text}>{error}</CustomText>
            <Card.Actions style={{ justifyContent: "center", width: "100%" }}>
              <CustomButton title="Try Again" onPress={handleRetry} />
              <CustomButton title="Go Back" onPress={() => router.back()} />
            </Card.Actions>
          </Card.Content>
        </Card>
      </View>
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
        // Only show completed screen after the user has clicked next on the last question
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
