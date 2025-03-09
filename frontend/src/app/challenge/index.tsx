import React from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme, Button } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { router } from "expo-router";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";
import { useChallenge } from "@src/hooks/useChallenge";

const ChallengeScreen: React.FC = () => {
  const theme = useTheme();
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
    getCompletionMessage,
  } = useChallenge();

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Challenge" />
        <View style={styles.centeredContainer}>
          <LoadingIndicator size="large" color={theme.colors.primary} />
          <CustomText style={{ marginTop: 16, color: theme.colors.primary }}>
            Loading challenge...
          </CustomText>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Challenge" />
        <ErrorMessage
          message={error}
          onRetry={() => fetchChallenge()}
          fullScreen
          buttonText="Try Again"
        />
      </View>
    );
  }

  // No questions available
  if (!currentQuestion && !isCompleted) {
    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Challenge" />
        <View style={styles.centeredContainer}>
          <CustomText variant="titleMedium">No questions available</CustomText>
        </View>
      </View>
    );
  }

  // Challenge completed
  if (isCompleted) {
    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Daily Challenge" />
        <View style={styles.centeredContainer}>
          <CustomText variant="headlineMedium" style={styles.marginBottom}>
            Challenge Completed!
          </CustomText>
          <CustomText variant="titleLarge" style={styles.marginBottom}>
            Your Score: {score}/{questions.length}
          </CustomText>
          <CustomText variant="bodyLarge" style={styles.marginBottom}>
            {getCompletionMessage()}
          </CustomText>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              style={styles.button}
              onPress={() => router.back()}
            >
              Return to Home
            </Button>

            <Button
              mode="outlined"
              style={styles.button}
              onPress={() => fetchChallenge(true)}
              loading={loading}
            >
              Generate New Challenge
            </Button>
          </View>
        </View>
      </View>
    );
  }

  // Active challenge
  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Challenge" />
      <ScrollView contentContainerStyle={styles.content}>
        <CustomText variant="titleMedium" style={styles.marginBottom}>
          Daily Challenge
        </CustomText>

        {currentQuestion && (
          <>
            <CustomText variant="bodyLarge" style={styles.marginBottom}>
              {currentQuestion.question}
            </CustomText>

            {currentQuestion.options.map((option) => (
              <Button
                key={option}
                mode="outlined"
                style={[
                  styles.button,
                  isCorrectAnswer !== null &&
                    option === currentQuestion.correctAnswer && {
                      backgroundColor: theme.colors.primary,
                    },
                  isCorrectAnswer === false &&
                    option !== currentQuestion.correctAnswer && {
                      backgroundColor: theme.colors.error,
                    },
                ]}
                disabled={isCorrectAnswer !== null}
                onPress={() => handleAnswer(option)}
              >
                {option}
              </Button>
            ))}

            {isCorrectAnswer !== null && (
              <View style={styles.feedbackContainer}>
                <CustomText
                  style={{
                    color: isCorrectAnswer
                      ? theme.colors.primary
                      : theme.colors.error,
                  }}
                >
                  {isCorrectAnswer ? "Correct!" : "Incorrect!"}
                </CustomText>

                {currentQuestion.exampleSentence && (
                  <CustomText variant="bodyMedium" style={styles.marginTop}>
                    {currentQuestion.exampleSentence}
                  </CustomText>
                )}

                <Button
                  mode="contained"
                  style={styles.marginTop}
                  onPress={handleNextQuestion}
                >
                  {currentIndex < questions.length - 1
                    ? "Next Question"
                    : "Complete Challenge"}
                </Button>
              </View>
            )}

            <CustomText variant="bodyMedium" style={styles.progress}>
              Question {currentIndex + 1} of {questions.length}
            </CustomText>
          </>
        )}
      </ScrollView>
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
    padding: 20,
  },
  content: {
    padding: 16,
  },
  marginBottom: {
    marginBottom: 16,
  },
  marginTop: {
    marginTop: 16,
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 16,
  },
  feedbackContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
  },
  progress: {
    textAlign: "center",
    marginTop: 24,
  },
});

export default ChallengeScreen;
