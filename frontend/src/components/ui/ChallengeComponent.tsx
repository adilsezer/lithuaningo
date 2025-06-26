import React, { useRef, useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  useTheme,
  Button,
  Surface,
  Card,
  Text,
  ActivityIndicator,
  ProgressBar,
  Divider,
  Avatar,
} from "react-native-paper";
import { router } from "expo-router";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import CustomDivider from "@components/ui/CustomDivider";
import { ChallengeQuestionResponse, ChallengeQuestionType } from "@src/types";
import { useIsPremium } from "@stores/useUserStore";
import { useChallengeExplanation } from "@hooks/useChallengeExplanation";
import CustomText from "./CustomText";

// Define props interface for the reusable component
interface ChallengeComponentProps {
  questions: ChallengeQuestionResponse[];
  currentIndex: number;
  currentQuestion?: ChallengeQuestionResponse;
  loading: boolean;
  error: string | null;
  score: number;
  isCorrectAnswer: boolean | null;
  isCompleted: boolean;
  title?: string;
  onAnswer: (answer: string) => Promise<void> | void;
  onNextQuestion: () => Promise<void> | void;
  onRetry: () => Promise<void> | void;
  onGoBack?: () => void;
  onGenerateNew?: () => Promise<void> | void;
  customCompletionComponent?: React.ReactNode;
}

const ChallengeComponent: React.FC<ChallengeComponentProps> = ({
  questions,
  currentIndex,
  currentQuestion,
  loading,
  error,
  score,
  isCorrectAnswer,
  isCompleted,
  onAnswer,
  onNextQuestion,
  onRetry,
  onGoBack = () => router.back(),
  onGenerateNew,
  customCompletionComponent,
}) => {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const isPremium = useIsPremium();
  const {
    explanation,
    isLoading: isLoadingExplanation,
    error: explanationError,
    fetchExplanation,
    clearExplanation,
  } = useChallengeExplanation();

  // Reset states when the question changes
  useEffect(() => {
    if (isCorrectAnswer === null) {
      setSelectedAnswer(null);
      clearExplanation();
    }
  }, [currentIndex, isCorrectAnswer, clearExplanation]);

  // Scroll to bottom when feedback or explanation appears
  useEffect(() => {
    if ((isCorrectAnswer !== null || explanation) && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [isCorrectAnswer, explanation]);

  // Handler for Learn More button
  const handleLearnMore = () => {
    if (!currentQuestion || !selectedAnswer) return;

    if (!isPremium) {
      router.push("/(app)/premium");
      return;
    }

    fetchExplanation({
      question: currentQuestion.question,
      correctAnswer: currentQuestion.correctAnswer,
      userAnswer: selectedAnswer,
      options: currentQuestion.options,
      exampleSentence: currentQuestion.exampleSentence,
      questionType: ChallengeQuestionType[currentQuestion.type],
    });
  };

  // Simple helper for button styling
  const getOptionButtonProps = (option: string) => {
    const isCorrect = option === currentQuestion?.correctAnswer;
    const isSelected = option === selectedAnswer;
    const isRevealed = isCorrectAnswer !== null;

    let mode:
      | "text"
      | "contained"
      | "outlined"
      | "elevated"
      | "contained-tonal" = "outlined";
    let color = theme.colors.primary;
    let textColor = theme.colors.onBackground;

    // For incorrect selection
    if (isRevealed && isSelected && !isCorrect) {
      mode = "contained";
      color = theme.colors.error;
      textColor = theme.colors.onError;
    }

    // For correct answer reveal
    if (isRevealed && isCorrect) {
      mode = "contained";
      color = theme.colors.primary;
      textColor = theme.colors.onPrimary;
    }

    return {
      mode,
      buttonStyle: [
        styles.optionButton,
        {
          borderColor: color,
          backgroundColor: mode === "contained" ? color : undefined,
        },
      ],
      labelStyle: [styles.optionButtonLabel, { color: textColor }],
    };
  };

  // Example sentence visibility based on question type
  const shouldShowExampleSentence = (
    question: ChallengeQuestionResponse
  ): boolean => {
    // No example to show
    if (!question.exampleSentence) {
      return false;
    }

    // Don't show if example is directly part of the question
    if (question.question.includes(question.exampleSentence)) {
      return false;
    }

    // Type-specific rules
    switch (question.type) {
      case ChallengeQuestionType.FillInTheBlank:
        // Never show examples with the answer for fill-in-blank
        return !question.exampleSentence.includes(question.correctAnswer);

      case ChallengeQuestionType.TrueFalse:
        // For true/false, only show if it doesn't contain the answer
        return !question.exampleSentence.includes(question.correctAnswer);

      case ChallengeQuestionType.RearrangeTheSentence:
        // Never show example sentence for sentence rearrangement as it gives away the answer
        return false;

      case ChallengeQuestionType.MultipleChoice:
        // For vocabulary questions, hide if example contains answer
        if (
          question.question.includes("mean") ||
          question.question.includes("translation")
        ) {
          return !question.exampleSentence.includes(question.correctAnswer);
        }
        return true;

      default:
        return true;
    }
  };

  // Loading state
  if (loading) {
    return (
      <Surface style={styles.centeredContainer} elevation={0}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            animating
          />
          <View style={styles.loadingTextContainer}>
            <CustomText
              variant="titleMedium"
              style={{ color: theme.colors.primary }}
            >
              🤖 Lithuaningo AI is setting up your challenge...
            </CustomText>
            <CustomText variant="bodySmall">
              No need to wait—come back to this screen anytime!
            </CustomText>
            <Text
              variant="bodySmall"
              style={{
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Preparing your personalized questions
            </Text>
          </View>
        </View>
      </Surface>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={onRetry}
        fullScreen
        buttonText="Try Again"
      />
    );
  }

  // No questions available
  if (!currentQuestion && !isCompleted) {
    return (
      <Surface style={styles.centeredContainer} elevation={0}>
        <View style={styles.emptyStateContainer}>
          <Avatar.Icon
            size={64}
            icon="help-circle-outline"
            color={theme.colors.onSurfaceDisabled}
            style={{ backgroundColor: "transparent" }}
          />
          <View style={styles.emptyStateTextContainer}>
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              No Questions Available
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
              }}
            >
              We couldn't find any challenge questions right now
            </Text>
          </View>
          {onGenerateNew && (
            <Button
              mode="contained"
              onPress={onGenerateNew}
              style={{ marginTop: 24 }}
            >
              Generate New Challenge
            </Button>
          )}
        </View>
      </Surface>
    );
  }

  // Challenge completed
  if (isCompleted) {
    if (customCompletionComponent) {
      return <>{customCompletionComponent}</>;
    }

    const percentage =
      questions.length > 0 ? (score / questions.length) * 100 : 0;
    const isHighScore = percentage >= 75;

    return (
      <Surface style={styles.centeredContainer} elevation={0}>
        <Card
          style={[
            styles.completionCard,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Card.Content style={styles.completionContent}>
            <Avatar.Icon
              size={80}
              icon={isHighScore ? "trophy" : "check-circle"}
              color={
                isHighScore ? theme.colors.primary : theme.colors.secondary
              }
              style={{ backgroundColor: "transparent" }}
            />

            <View style={styles.completionHeaderContainer}>
              <Text variant="headlineMedium">Challenge Completed!</Text>
              <Text
                variant="bodyMedium"
                style={{
                  textAlign: "center",
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                Great job on your Lithuanian practice
              </Text>
            </View>

            <View style={styles.scoreContainer}>
              <ProgressBar
                progress={percentage / 100}
                color={
                  isHighScore ? theme.colors.primary : theme.colors.secondary
                }
                style={styles.progressBar}
              />

              <Text variant="titleLarge" style={{ marginTop: 8 }}>
                {score}/{questions.length} Points
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.feedbackContainer}>
              <Text
                variant="bodyMedium"
                style={{
                  textAlign: "center",
                  color: theme.colors.onSurfaceVariant,
                  marginTop: 8,
                }}
              >
                Daily challenges reinforce your learning. Come back tomorrow for
                new questions!
              </Text>
            </View>
          </Card.Content>

          <Card.Actions style={styles.buttonContainer}>
            <Button
              mode="contained"
              style={styles.button}
              icon="home"
              onPress={onGoBack}
            >
              Return to Home
            </Button>
          </Card.Actions>
        </Card>
      </Surface>
    );
  }

  // Active challenge
  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={styles.challengeSurface} elevation={0}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
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
            {/* First question intro only appears on first question */}
            {currentIndex === 0 && (
              <Text
                variant="bodySmall"
                style={{
                  textAlign: "center",
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 12,
                }}
              >
                Test your Lithuanian skills with this challenge
              </Text>
            )}
            <Card
              style={[
                styles.questionCard,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <Card.Content style={styles.questionContent}>
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                  }}
                >
                  Question:
                </Text>
                <Text variant="headlineSmall" style={styles.questionText}>
                  {currentQuestion.question}
                </Text>

                <CustomDivider />

                {/* Handle example sentences intelligently based on question type */}
                {currentQuestion.exampleSentence &&
                  shouldShowExampleSentence(currentQuestion) && (
                    <>
                      <Text
                        variant="bodySmall"
                        style={{
                          color: theme.colors.onSurfaceVariant,
                          marginTop: 12,
                          marginBottom: 4,
                        }}
                      >
                        Example:
                      </Text>
                      <Text variant="bodyMedium" style={styles.exampleSentence}>
                        "{currentQuestion.exampleSentence}"
                      </Text>
                    </>
                  )}
              </Card.Content>
            </Card>

            <View style={styles.optionLabelContainer}>
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                Select the correct answer:
              </Text>
            </View>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option) => {
                const { mode, buttonStyle, labelStyle } =
                  getOptionButtonProps(option);
                return (
                  <Button
                    key={option}
                    mode={mode}
                    style={buttonStyle}
                    labelStyle={labelStyle}
                    contentStyle={styles.optionButtonContent}
                    disabled={isCorrectAnswer !== null}
                    onPress={() => {
                      setSelectedAnswer(option);
                      onAnswer(option);
                    }}
                  >
                    {option}
                  </Button>
                );
              })}
            </View>

            {isCorrectAnswer !== null && (
              <Card
                style={[
                  styles.feedbackCard,
                  {
                    backgroundColor: isCorrectAnswer
                      ? theme.colors.primary
                      : theme.colors.error,
                  },
                ]}
              >
                <Card.Content style={styles.feedbackContent}>
                  <View style={styles.feedbackIconContainer}>
                    <Avatar.Icon
                      size={48}
                      icon={isCorrectAnswer ? "check-circle" : "close-circle"}
                      color={
                        isCorrectAnswer
                          ? theme.colors.onPrimary
                          : theme.colors.onError
                      }
                      style={{ backgroundColor: "transparent" }}
                    />
                  </View>

                  <View style={styles.feedbackTextContainer}>
                    <Text
                      variant="titleMedium"
                      style={{
                        color: isCorrectAnswer
                          ? theme.colors.onPrimary
                          : theme.colors.onError,
                        fontWeight: "600",
                      }}
                    >
                      {isCorrectAnswer ? "Correct!" : "Incorrect!"}
                    </Text>

                    <Text
                      variant="bodyMedium"
                      style={{
                        color: isCorrectAnswer
                          ? theme.colors.onPrimary
                          : theme.colors.onError,
                        marginTop: 4,
                      }}
                    >
                      {isCorrectAnswer ? (
                        "Puiku! Keep up the good work!"
                      ) : (
                        <>
                          The correct answer is:{" "}
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontSize: 16,
                            }}
                          >
                            {currentQuestion.correctAnswer}
                          </Text>
                        </>
                      )}
                    </Text>
                  </View>
                </Card.Content>

                <Card.Actions style={styles.feedbackActions}>
                  {/* AI Explanation Button */}
                  <Button
                    mode="text"
                    onPress={handleLearnMore}
                    icon={isPremium ? "lightbulb-on-outline" : "lock-outline"}
                    loading={isLoadingExplanation}
                    disabled={isLoadingExplanation}
                    labelStyle={{
                      color: isCorrectAnswer
                        ? theme.colors.onPrimary
                        : theme.colors.onError,
                    }}
                  >
                    {isPremium ? "Explain Answer" : "Explain Answer (Premium)"}
                  </Button>

                  {/* Next/Complete Button */}
                  <Button
                    mode="contained"
                    onPress={onNextQuestion}
                    icon={
                      currentIndex < questions.length - 1
                        ? "arrow-right"
                        : "check"
                    }
                    contentStyle={styles.feedbackButtonContent}
                    labelStyle={{
                      color: isCorrectAnswer
                        ? theme.colors.primary
                        : theme.colors.error,
                    }}
                    style={{
                      backgroundColor: isCorrectAnswer
                        ? theme.colors.onPrimary
                        : theme.colors.onError,
                    }}
                  >
                    {currentIndex < questions.length - 1
                      ? "Next Question"
                      : "Complete Challenge"}
                  </Button>
                </Card.Actions>

                {/* AI Explanation */}
                {explanation && (
                  <Card
                    style={[
                      styles.explanationCard,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.primary,
                        borderWidth: 1,
                        marginTop: 12,
                      },
                    ]}
                  >
                    <Card.Content>
                      <View style={styles.explanationHeader}>
                        <Avatar.Icon
                          size={32}
                          icon="robot"
                          color={theme.colors.primary}
                          style={{ backgroundColor: "transparent" }}
                        />
                        <Text
                          variant="titleSmall"
                          style={{
                            color: theme.colors.primary,
                            fontWeight: "600",
                            marginLeft: 8,
                          }}
                        >
                          AI Explanation
                        </Text>
                      </View>
                      <Text
                        variant="bodyMedium"
                        style={{
                          color: theme.colors.onSurfaceVariant,
                          lineHeight: 20,
                          marginTop: 8,
                        }}
                      >
                        {explanation}
                      </Text>
                    </Card.Content>
                  </Card>
                )}

                {/* Explanation Error */}
                {explanationError && (
                  <Card
                    style={[
                      styles.explanationCard,
                      {
                        backgroundColor: theme.colors.errorContainer,
                        marginTop: 12,
                      },
                    ]}
                  >
                    <Card.Content>
                      <Text
                        variant="bodyMedium"
                        style={{
                          color: theme.colors.onErrorContainer,
                          textAlign: "center",
                        }}
                      >
                        {explanationError}
                      </Text>
                    </Card.Content>
                  </Card>
                )}
              </Card>
            )}
          </>
        )}
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
    borderRadius: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingTextContainer: {
    marginTop: 24,
    alignItems: "center",
    gap: 4,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateTextContainer: {
    marginTop: 24,
    marginBottom: 24,
    alignItems: "center",
    gap: 4,
  },
  questionCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    borderWidth: 1,
  },
  questionContent: {
    padding: 16,
    overflow: "hidden",
  },
  questionText: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    width: "100%",
  },
  optionLabelContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
  },
  optionButtonLabel: {
    fontSize: 16,
    paddingVertical: 4,
    fontWeight: "500",
  },
  optionButtonContent: {
    height: 52,
    justifyContent: "center",
  },
  exampleSentence: {
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  completionCard: {
    width: "100%",
    padding: 8,
    borderRadius: 12,
  },
  completionContent: {
    alignItems: "center",
    padding: 8,
  },
  completionHeaderContainer: {
    marginTop: 16,
    marginBottom: 24,
    alignItems: "center",
    gap: 8,
  },
  scoreContainer: {
    width: "100%",
    marginBottom: 24,
    alignItems: "center",
  },
  feedbackContainer: {
    marginVertical: 16,
    alignItems: "center",
  },
  feedbackCard: {
    marginTop: 20,
    borderRadius: 12,
    elevation: 2,
  },
  feedbackContent: {
    padding: 16,
    overflow: "hidden",
  },
  feedbackIconContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  feedbackTextContainer: {
    alignItems: "center",
  },
  feedbackActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 8,
  },
  feedbackButtonContent: {
    height: 48,
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
  explanationCard: {
    borderRadius: 12,
    elevation: 2,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ChallengeComponent;
