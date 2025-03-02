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
  const { stats, updateStats, updateDailyStreak, incrementQuizzesCompleted } =
    useUserChallengeStats(userData?.id);

  useEffect(() => {
    fetchDailyQuiz();
  }, []);

  const fetchDailyQuiz = async () => {
    try {
      setLoading(true);
      const dailyQuestions = await quizService.getDailyQuiz();
      setQuestions(dailyQuestions);
    } catch (err) {
      setError("Failed to load quiz questions");
    } finally {
      setLoading(false);
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
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDailyQuiz} fullScreen />;
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
});

export default QuizScreen;
