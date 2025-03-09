import React, { useEffect, useState } from "react";
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
import { ChallengeQuestion } from "@src/types";
import { useUserData } from "@stores/useUserStore";
import challengeService from "@src/services/data/challengeService";
import { router } from "expo-router";
import { useUserChallengeStats } from "@src/hooks/useUserChallengeStats";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";

const ChallengeScreen: React.FC = () => {
  const theme = useTheme();
  const userData = useUserData();
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);
  const [generatingNewChallenge, setGeneratingNewChallenge] = useState(false);
  const {
    stats,
    updateStats,
    updateDailyStreak,
    incrementChallengesCompleted: incrementChallengesCompleted,
  } = useUserChallengeStats(userData?.id);

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  // Effect for tracking generation time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGeneratingQuestions) {
      timer = setInterval(() => {
        setGenerationTime((prev) => prev + 1);
      }, 1000);
    } else {
      setGenerationTime(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGeneratingQuestions]);

  const fetchDailyChallenge = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      // First API call might trigger question generation
      setIsGeneratingQuestions(true);
      const dailyQuestions = await challengeService.getDailyChannel();
      setIsGeneratingQuestions(false);

      if (dailyQuestions.length === 0) {
        setError(
          "No challenge questions available for today. Please try again later."
        );
        return;
      }

      setQuestions(dailyQuestions);
    } catch (err) {
      console.error("Failed to load challenge questions:", err);
      setError(
        "Failed to load challenge questions. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    const currentQuestion = questions[currentIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    setSelectedAnswer(answer);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (stats && userData?.id) {
      await updateStats({
        todayCorrectAnswers: isCorrect
          ? stats.todayCorrectAnswers + 1
          : stats.todayCorrectAnswers,
        todayIncorrectAnswers: !isCorrect
          ? stats.todayIncorrectAnswers + 1
          : stats.todayIncorrectAnswers,
        totalCorrectAnswers: isCorrect
          ? stats.totalCorrectAnswers + 1
          : stats.totalCorrectAnswers,
        totalIncorrectAnswers: !isCorrect
          ? stats.totalIncorrectAnswers + 1
          : stats.totalIncorrectAnswers,
      });
    }

    if (currentQuestion.exampleSentence) {
      setShowExplanation(true);
    } else {
      await moveToNextQuestion();
    }
  };

  const moveToNextQuestion = async () => {
    setShowExplanation(false);
    setSelectedAnswer(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (userData?.id) {
        await Promise.all([
          challengeService.submitChallengeResult({
            userId: userData.id,
            deckId: "daily",
            score,
            totalQuestions: questions.length,
          }),
          updateDailyStreak(),
          incrementChallengesCompleted(),
        ]);
      }
      setIsCompleted(true);
    }
  };

  const handleGenerateNewChallenge = async () => {
    try {
      setGeneratingNewChallenge(true);
      setError(null);
      setLoading(true);

      // Reset the challenge state
      setCurrentIndex(0);
      setScore(0);
      setShowExplanation(false);
      setSelectedAnswer(null);
      setIsCompleted(false);

      // Generate new questions
      const newQuestions = await challengeService.generateNewChallenge();

      if (newQuestions.length === 0) {
        setError(
          "Failed to generate new challenge questions. Please try again."
        );
      } else {
        setQuestions(newQuestions);
        console.log(`Generated ${newQuestions.length} new challenge questions`);
      }
    } catch (error: any) {
      console.error("Error generating new challenge:", error);
      setError(error?.message || "Failed to generate new challenge questions");
    } finally {
      setGeneratingNewChallenge(false);
      setLoading(false);
    }
  };

  // Add this function outside all conditional blocks to provide feedback on challenge completion
  const getCompletionMessage = () => {
    const percentage = (score / questions.length) * 100;

    if (percentage >= 90) {
      return "Puiku! (Excellent!) Your Lithuanian skills are impressive!";
    } else if (percentage >= 75) {
      return "Labai gerai! (Very good!) You're making great progress!";
    } else if (percentage >= 60) {
      return "Gerai! (Good!) Keep practicing to improve your skills.";
    } else if (percentage >= 40) {
      return "Neblogai. (Not bad.) More practice will help you improve.";
    } else {
      return "Keep learning! Practice makes perfect in Lithuanian.";
    }
  };

  if (loading) {
    // Format the time as mm:ss
    const minutes = Math.floor(generationTime / 60);
    const seconds = generationTime % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    // Get message based on generation time
    const getMessage = () => {
      if (!isGeneratingQuestions) return "Loading challenge questions...";

      if (generationTime < 10) {
        return "Creating today's challenge questions with AI...";
      } else if (generationTime < 30) {
        return "Our AI is crafting challenging Lithuanian questions for you...";
      } else if (generationTime < 60) {
        return "Creating personalized challenge questions. This may take a moment...";
      } else if (generationTime < 90) {
        return "Still working on your challenge. AI generation can take some time...";
      } else {
        return "Almost there! Finalizing your challenge questions...";
      }
    };

    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Challenge" />
        <View style={styles.loadingContainer}>
          <LoadingIndicator size="large" color={theme.colors.primary} />
          <CustomText
            variant="bodyLarge"
            style={[styles.loadingText, { color: theme.colors.primary }]}
          >
            {getMessage()}
          </CustomText>
          {isGeneratingQuestions && (
            <>
              <CustomText
                variant="bodyMedium"
                style={[
                  styles.loadingSubtext,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                We're preparing unique questions to help you practice
                Lithuanian!
              </CustomText>

              {generationTime > 15 && (
                <View style={styles.timerContainer}>
                  <CustomText variant="bodySmall" style={styles.timerText}>
                    Time elapsed: {formattedTime}
                  </CustomText>
                  {generationTime > 45 && (
                    <CustomText variant="bodySmall" style={styles.timerText}>
                      AI generation can take some time. Thank you for your
                      patience.
                    </CustomText>
                  )}
                  {generationTime > 90 && (
                    <CustomText variant="bodySmall" style={styles.timerText}>
                      Still working... You can try again later if this
                      continues.
                    </CustomText>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Challenge" />
        <ErrorMessage
          message={error}
          onRetry={fetchDailyChallenge}
          fullScreen
          buttonText="Try Again"
        />
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion && !isCompleted) {
    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Challenge" />
        <CustomText variant="titleMedium" style={styles.title}>
          No questions available
        </CustomText>
      </View>
    );
  }

  if (isCompleted) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <HeaderWithBackButton title="Daily Challenge" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.completionContainer}>
            <CustomText variant="headlineMedium" style={styles.completionTitle}>
              Challenge Completed!
            </CustomText>
            <CustomText variant="titleLarge" style={styles.scoreText}>
              Your Score: {score}/{questions.length}
            </CustomText>
            <CustomText variant="bodyLarge" style={styles.feedbackText}>
              {getCompletionMessage()}
            </CustomText>

            <View style={styles.buttonGroup}>
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
                onPress={handleGenerateNewChallenge}
                loading={generatingNewChallenge}
                disabled={generatingNewChallenge}
              >
                Generate New Challenge
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView>
        <HeaderWithBackButton title="Challenge" />
        <View style={styles.content}>
          <CustomText variant="titleMedium" style={styles.title}>
            Daily Challenge
          </CustomText>

          <CustomText variant="bodyLarge" style={styles.question}>
            {currentQuestion.question}
          </CustomText>

          {currentQuestion.options.map((option) => (
            <Button
              key={option}
              mode="outlined"
              style={[
                styles.optionButton,
                selectedAnswer === option && {
                  backgroundColor:
                    option === currentQuestion.correctAnswer
                      ? theme.colors.primary
                      : theme.colors.error,
                },
              ]}
              disabled={!!selectedAnswer}
              onPress={() => handleAnswer(option)}
            >
              {option}
            </Button>
          ))}

          {showExplanation && currentQuestion.exampleSentence && (
            <View style={styles.explanationContainer}>
              <CustomText variant="bodyMedium" style={styles.explanation}>
                {currentQuestion.exampleSentence}
              </CustomText>
              <Button mode="contained" onPress={moveToNextQuestion}>
                Next Question
              </Button>
            </View>
          )}

          <CustomText variant="bodyMedium" style={styles.progress}>
            Question {currentIndex + 1} of {questions.length}
          </CustomText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  question: {
    marginBottom: 16,
  },
  optionButton: {
    marginVertical: 8,
  },
  progress: {
    textAlign: "center",
    marginTop: 16,
  },
  explanationContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  explanation: {
    marginBottom: 16,
  },
  score: {
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  loadingSubtext: {
    marginTop: 8,
    textAlign: "center",
    opacity: 0.8,
  },
  timerContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  timerText: {
    textAlign: "center",
    marginTop: 4,
    opacity: 0.7,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  completionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  completionTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  scoreText: {
    marginBottom: 16,
    textAlign: "center",
  },
  feedbackText: {
    marginBottom: 24,
    textAlign: "center",
  },
  buttonGroup: {
    width: "100%",
    marginTop: 16,
  },
});

export default ChallengeScreen;
