import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useChallenge } from "@src/hooks/useChallenge";
import ChallengeComponent from "@components/ui/ChallengeComponent";
import { Card, Button } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { router } from "expo-router";
import { useUserData } from "@stores/useUserStore";

/**
 * Daily Challenge Screen
 */
export default function DailyChallengeScreen() {
  const userData = useUserData();
  const userId = userData?.id;

  // Get challenge data and handlers
  const {
    questions,
    currentIndex,
    currentQuestion,
    loading,
    error,
    score,
    isCorrectAnswer,
    isCompleted,
    dailyChallengeCompleted,
    fetchChallenge,
    handleAnswer,
    handleNextQuestion,
    checkDailyChallengeStatus,
    getCompletionMessage,
  } = useChallenge();

  // Load challenge on mount
  useEffect(() => {
    if (!userId) return;

    async function loadChallenge() {
      const isCompleted = await checkDailyChallengeStatus();
      if (!isCompleted) fetchChallenge();
    }

    loadChallenge();
  }, [userId, checkDailyChallengeStatus, fetchChallenge]);

  // Handle "already completed" state
  if (dailyChallengeCompleted && !isCompleted) {
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
            <Button
              mode="contained"
              onPress={() => router.back()}
              style={styles.button}
            >
              Back to Home
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // Render the challenge
  return (
    <View style={styles.container}>
      <ChallengeComponent
        title="Daily Challenge"
        questions={questions}
        currentIndex={currentIndex}
        currentQuestion={currentQuestion}
        loading={loading}
        error={error}
        score={score}
        isCorrectAnswer={isCorrectAnswer}
        isCompleted={isCompleted}
        onAnswer={handleAnswer}
        onNextQuestion={handleNextQuestion}
        onRetry={() => fetchChallenge()}
        onGenerateNew={() => fetchChallenge(true)}
        onGoBack={() => router.back()}
        getCompletionMessage={getCompletionMessage}
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
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
});
