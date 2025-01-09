import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { QuizQuestion } from "@src/types";
import { AlertDialog } from "@components/ui/AlertDialog";
import { SectionTitle } from "@components/typography";
import CustomButton from "@components/ui/CustomButton";
import quizService from "@services/data/quizService";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import BackButton from "@components/layout/BackButton";

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    startQuiz();
  }, [id]);

  const startQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await quizService.startQuiz(id as string);
      setQuestions(data);
      setAnswers(new Array(data.length).fill(false));
    } catch (err) {
      setError("Failed to start quiz. Please try again.");
      console.error("Error starting quiz:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = isCorrect;
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleQuizComplete(newAnswers);
    }
  };

  const handleQuizComplete = async (finalAnswers: boolean[]) => {
    if (!userData) {
      AlertDialog.error("Please login to save quiz results");
      return;
    }

    try {
      setIsSubmitting(true);
      const correctAnswers = finalAnswers.filter(Boolean).length;
      await quizService.submitQuizResult({
        deckId: id as string,
        userId: userData.id,
        score: correctAnswers,
        totalQuestions: questions.length,
      });

      AlertDialog.success(
        `Quiz completed! Score: ${correctAnswers}/${questions.length}`
      );
      router.back();
    } catch (err) {
      AlertDialog.error("Failed to save quiz results");
      console.error("Error submitting quiz results:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isSubmitting) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.active} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <BackButton />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <CustomButton title="Retry" onPress={startQuiz} />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No questions available
        </Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackButton />
      <SectionTitle>Quiz</SectionTitle>
      <Text style={[styles.progress, { color: colors.text }]}>
        Question {currentIndex + 1} of {questions.length}
      </Text>
      <ScrollView
        style={styles.questionContainer}
        contentContainerStyle={styles.questionContent}
      >
        <Text style={[styles.questionText, { color: colors.text }]}>
          {currentQuestion.question}
        </Text>
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <CustomButton
              key={index}
              title={option}
              onPress={() =>
                handleAnswer(index === currentQuestion.correctIndex)
              }
              style={[styles.optionButton, { backgroundColor: colors.card }]}
              textStyle={{ color: colors.text }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  progress: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 8,
  },
  questionContainer: {
    flex: 1,
  },
  questionContent: {
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    paddingVertical: 16,
  },
});
