import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";
import { useChallenge } from "@src/hooks/useChallenge";
import ChallengeComponent from "@components/challenge/ChallengeComponent";
import { Card, Button } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { router } from "expo-router";
import { useUserData } from "@stores/useUserStore";

const ChallengeScreen: React.FC = () => {
  const userData = useUserData();
  const {
    questions,
    currentIndex,
    currentQuestion,
    loading,
    error,
    score,
    isCorrectAnswer,
    isCompleted,
    fetchChallenge,
    handleAnswer,
    handleNextQuestion,
    resetChallenge,
    getCompletionMessage,
    dailyChallengeCompleted,
    checkDailyChallengeStatus,
  } = useChallenge();

  // Check daily challenge status immediately on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (userData?.id) {
        const isCompleted = await checkDailyChallengeStatus();
        // Only fetch challenge if not completed
        if (!isCompleted) {
          fetchChallenge();
        }
      }
    };

    checkStatus();
  }, [userData?.id, checkDailyChallengeStatus, fetchChallenge]);

  // Show completed message if the daily challenge is already completed
  if (dailyChallengeCompleted && !isCompleted) {
    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Daily Challenge" />
        <View style={styles.centeredContainer}>
          <Card style={styles.completedCard}>
            <Card.Content>
              <CustomText variant="titleLarge" style={styles.completedTitle}>
                Challenge Completed!
              </CustomText>
              <CustomText style={styles.completedText}>
                You've already completed today's challenge. Come back tomorrow
                for a new one!
              </CustomText>
              <Button
                mode="contained"
                onPress={() => router.back()}
                style={styles.homeButton}
              >
                Back to Home
              </Button>
            </Card.Content>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Daily Challenge" />
      <ChallengeComponent
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
        getCompletionMessage={getCompletionMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  completedCard: {
    width: "100%",
    padding: 8,
  },
  completedTitle: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "bold",
  },
  completedText: {
    textAlign: "center",
    marginBottom: 24,
  },
  homeButton: {
    marginTop: 16,
  },
});

export default ChallengeScreen;
