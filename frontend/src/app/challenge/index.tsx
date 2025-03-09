import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  useTheme,
  Button,
  Surface,
  Card,
  Text,
  ActivityIndicator,
  ProgressBar,
  Chip,
  Divider,
  IconButton,
  Banner,
  Avatar,
} from "react-native-paper";
import { router } from "expo-router";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";
import { ErrorMessage } from "@components/ui/ErrorMessage";
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
        <Surface style={styles.centeredContainer} elevation={0}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            animating={true}
          />
          <Text
            variant="bodyLarge"
            style={{ marginTop: 16, color: theme.colors.primary }}
          >
            Loading challenge...
          </Text>
        </Surface>
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
        <Surface style={styles.centeredContainer} elevation={0}>
          <Avatar.Icon
            size={64}
            icon="help-circle-outline"
            color={theme.colors.onSurfaceDisabled}
            style={{ backgroundColor: "transparent", marginBottom: 16 }}
          />
          <Text variant="titleMedium">No questions available</Text>
          <Button
            mode="contained"
            onPress={() => fetchChallenge(true)}
            style={{ marginTop: 24 }}
          >
            Generate New Challenge
          </Button>
        </Surface>
      </View>
    );
  }

  // Challenge completed
  if (isCompleted) {
    const completionMessage = getCompletionMessage();
    const percentage =
      questions.length > 0 ? (score / questions.length) * 100 : 0;
    const isHighScore = percentage >= 75;

    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Daily Challenge" />
        <Surface style={styles.centeredContainer} elevation={0}>
          <Card style={styles.completionCard}>
            <Card.Content style={{ alignItems: "center" }}>
              <Avatar.Icon
                size={80}
                icon={isHighScore ? "trophy" : "check-circle"}
                color={
                  isHighScore ? theme.colors.primary : theme.colors.secondary
                }
                style={{ backgroundColor: "transparent", marginBottom: 8 }}
              />

              <Text variant="headlineMedium" style={styles.marginBottom}>
                Challenge Completed!
              </Text>

              <ProgressBar
                progress={percentage / 100}
                color={
                  isHighScore ? theme.colors.primary : theme.colors.secondary
                }
                style={styles.progressBar}
              />

              <Text variant="titleLarge" style={styles.marginBottom}>
                {score}/{questions.length} Points
              </Text>

              <Divider style={styles.divider} />

              <Text
                variant="bodyLarge"
                style={[styles.marginBottom, { textAlign: "center" }]}
              >
                {completionMessage}
              </Text>
            </Card.Content>

            <Card.Actions style={styles.buttonContainer}>
              <Button
                mode="contained"
                style={styles.button}
                icon="home"
                onPress={() => router.back()}
              >
                Return to Home
              </Button>

              <Button
                mode="outlined"
                style={styles.button}
                icon="refresh"
                onPress={() => fetchChallenge(true)}
                loading={loading}
              >
                New Challenge
              </Button>
            </Card.Actions>
          </Card>
        </Surface>
      </View>
    );
  }

  // Active challenge
  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Challenge" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.challengeSurface} elevation={1}>
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
              Question {currentIndex + 1} of {questions.length}
            </Text>
            <ProgressBar
              progress={currentIndex / (questions.length - 1)}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </View>

          {currentQuestion && (
            <>
              <Card style={styles.questionCard}>
                <Card.Content>
                  <Text variant="titleLarge" style={styles.questionText}>
                    {currentQuestion.question}
                  </Text>

                  {currentQuestion.exampleSentence && (
                    <View
                      style={[
                        styles.exampleContainer,
                        { borderLeftColor: theme.colors.primary },
                      ]}
                    >
                      <Text variant="bodyMedium" style={styles.exampleSentence}>
                        "{currentQuestion.exampleSentence}"
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>

              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option) => (
                  <Button
                    key={option}
                    mode={
                      isCorrectAnswer !== null &&
                      option === currentQuestion.correctAnswer
                        ? "contained"
                        : "outlined"
                    }
                    style={[
                      styles.optionButton,
                      isCorrectAnswer !== null &&
                        option === currentQuestion.correctAnswer && {
                          backgroundColor: theme.colors.primary,
                        },
                    ]}
                    labelStyle={styles.optionButtonLabel}
                    contentStyle={styles.optionButtonContent}
                    disabled={isCorrectAnswer !== null}
                    onPress={() => handleAnswer(option)}
                  >
                    {option}
                  </Button>
                ))}
              </View>

              {isCorrectAnswer !== null && (
                <Banner
                  visible={true}
                  icon={({ size }) => (
                    <Avatar.Icon
                      size={40}
                      icon={isCorrectAnswer ? "check-circle" : "close-circle"}
                      color={
                        isCorrectAnswer
                          ? theme.colors.primary
                          : theme.colors.error
                      }
                      style={{ backgroundColor: "transparent" }}
                    />
                  )}
                  style={[
                    styles.feedbackBanner,
                    {
                      backgroundColor: isCorrectAnswer
                        ? theme.colors.primaryContainer
                        : theme.colors.errorContainer,
                    },
                  ]}
                >
                  <Text
                    variant="titleMedium"
                    style={{
                      color: isCorrectAnswer
                        ? theme.colors.primary
                        : theme.colors.error,
                      marginBottom: 4,
                    }}
                  >
                    {isCorrectAnswer ? "Correct!" : "Incorrect!"}
                  </Text>

                  <Button
                    mode="contained"
                    style={styles.marginTop}
                    onPress={handleNextQuestion}
                    icon={
                      currentIndex < questions.length - 1
                        ? "arrow-right"
                        : "check"
                    }
                  >
                    {currentIndex < questions.length - 1
                      ? "Next Question"
                      : "Complete Challenge"}
                  </Button>
                </Banner>
              )}
            </>
          )}
        </Surface>
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  challengeSurface: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  questionCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  questionText: {
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    marginBottom: 8,
    borderRadius: 8,
  },
  optionButtonLabel: {
    fontSize: 16,
    paddingVertical: 6,
  },
  optionButtonContent: {
    height: 56,
  },
  marginBottom: {
    marginBottom: 16,
  },
  marginTop: {
    marginTop: 16,
  },
  completionCard: {
    width: "100%",
    padding: 8,
    borderRadius: 12,
  },
  feedbackBanner: {
    marginTop: 16,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  exampleContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  exampleSentence: {
    fontStyle: "italic",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "column",
    padding: 16,
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
    width: "100%",
  },
  divider: {
    width: "80%",
    marginVertical: 16,
  },
});

export default ChallengeScreen;
