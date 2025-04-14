import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import ChallengeComponent from "@components/ui/ChallengeComponent";
import { Card } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { router } from "expo-router";
import { useUserData } from "@stores/useUserStore";
import { useChallenge } from "@hooks/useChallenge";
import { useChallengeStats } from "@hooks/useChallengeStats";

/**
 * Daily Challenge Screen
 */
export default function DailyChallengeScreen() {
  const userData = useUserData();
  const userId = userData?.id;

  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);

  // Hooks
  const {
    questions,
    isLoading: questionsLoading,
    error: questionsError,
    getDailyChallengeQuestions,
  } = useChallenge();
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    submitChallengeAnswer,
  } = useChallengeStats(userId);

  // Derived state
  const currentQuestion = questions[currentIndex];
  const isCompleted = stats?.hasCompletedTodayChallenge || false;
  const isLoading = questionsLoading || statsLoading;
  const error = questionsError || statsError;

  // Load questions
  useEffect(() => {
    if (userId) getDailyChallengeQuestions();
  }, [userId, getDailyChallengeQuestions]);

  // Handle user interactions
  const handleAnswer = async (answer: string) => {
    if (!currentQuestion || isCorrectAnswer !== null) return;

    const isCorrect = answer === currentQuestion.correctAnswer;
    setIsCorrectAnswer(isCorrect);
    if (isCorrect) setScore((prev) => prev + 1);

    // Submit to backend
    if (userId && currentQuestion.id) {
      try {
        await submitChallengeAnswer({
          wasCorrect: isCorrect,
          challengeId: currentQuestion.id,
        });
      } catch (err) {
        console.error("Failed to submit answer:", err);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsCorrectAnswer(null);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsCorrectAnswer(null);
    getDailyChallengeQuestions();
  };

  // Already completed today's challenge
  if (isCompleted && currentIndex < questions.length - 1) {
    return (
      <View style={styles.completedContainer}>
        <Card>
          <Card.Content>
            <CustomText variant="titleLarge" style={styles.title}>
              Challenge Completed
            </CustomText>
            <CustomText style={styles.message}>
              You've already completed today's challenge. Come back tomorrow!
            </CustomText>
            <Card.Actions>
              <Card.Actions style={{ justifyContent: "center", width: "100%" }}>
                <CustomText
                  variant="labelLarge"
                  style={styles.button}
                  onPress={() => router.back()}
                >
                  Back to Home
                </CustomText>
              </Card.Actions>
            </Card.Actions>
          </Card.Content>
        </Card>
      </View>
    );
  }

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
        isCompleted={isCompleted || currentIndex === questions.length - 1}
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
  completedContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 16,
  },
  message: {
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    color: "#fff",
    backgroundColor: "#6200ee",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 8,
    textAlign: "center",
  },
});
