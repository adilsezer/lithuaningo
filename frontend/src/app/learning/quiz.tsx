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
import { QuizQuestion } from "@src/types";
import { useUserData } from "@stores/useUserStore";
import quizService from "@services/data/quizService";
import { router } from "expo-router";
import { useUserChallengeStats } from "@src/hooks/useUserChallengeStats";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";
const QuizScreen: React.FC = () => {
  const theme = useTheme();
  const userData = useUserData();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);
  const { stats, updateStats, updateDailyStreak, incrementQuizzesCompleted } =
    useUserChallengeStats(userData?.id);

  useEffect(() => {
    fetchDailyQuiz();
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

  const fetchDailyQuiz = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      // First API call might trigger question generation
      setIsGeneratingQuestions(true);
      const dailyQuestions = await quizService.getDailyQuiz();
      setIsGeneratingQuestions(false);

      if (dailyQuestions.length === 0) {
        setError(
          "No quiz questions available for today. Please try again later."
        );
        return;
      }

      setQuestions(dailyQuestions);
    } catch (err) {
      console.error("Failed to load quiz questions:", err);
      setError(
        "Failed to load quiz questions. Please check your internet connection and try again."
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
          quizService.submitQuizResult({
            userId: userData.id,
            deckId: "daily",
            score,
            totalQuestions: questions.length,
          }),
          updateDailyStreak(),
          incrementQuizzesCompleted(),
        ]);
      }
      setIsCompleted(true);
    }
  };

  if (loading) {
    // Format the time as mm:ss
    const minutes = Math.floor(generationTime / 60);
    const seconds = generationTime % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    // Get message based on generation time
    const getMessage = () => {
      if (!isGeneratingQuestions) return "Loading quiz questions...";

      if (generationTime < 10) {
        return "Creating today's quiz questions with AI...";
      } else if (generationTime < 30) {
        return "Our AI is crafting challenging Lithuanian questions for you...";
      } else if (generationTime < 60) {
        return "Creating personalized quiz questions. This may take a moment...";
      } else if (generationTime < 90) {
        return "Still working on your quiz. AI generation can take some time...";
      } else {
        return "Almost there! Finalizing your quiz questions...";
      }
    };

    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Quiz" />
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
        <HeaderWithBackButton title="Quiz" />
        <ErrorMessage
          message={error}
          onRetry={fetchDailyQuiz}
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
        <HeaderWithBackButton title="Quiz" />
        <CustomText variant="titleMedium" style={styles.title}>
          No questions available
        </CustomText>
      </View>
    );
  }

  if (isCompleted) {
    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Quiz" />
        <View style={styles.content}>
          <CustomText variant="titleMedium" style={styles.title}>
            Quiz Completed!
          </CustomText>
          <CustomText variant="bodyLarge" style={styles.score}>
            Your Score: {score}/{questions.length}
          </CustomText>
          <Button
            mode="contained"
            onPress={() => router.push("/dashboard/challenge")}
            style={styles.button}
          >
            Return to Challenge
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView>
        <HeaderWithBackButton title="Quiz" />
        <View style={styles.content}>
          <CustomText variant="titleMedium" style={styles.title}>
            Daily Quiz
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
    marginTop: 16,
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
});

export default QuizScreen;
