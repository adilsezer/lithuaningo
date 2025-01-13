import React, { useEffect } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import BackButton from "@components/layout/BackButton";
import { SectionTitle } from "@components/typography";
import CustomButton from "@components/ui/CustomButton";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { useQuiz } from "@hooks/useQuiz";

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const {
    currentQuestion,
    totalQuestions,
    currentIndex,
    isEmpty,
    isLoading,
    isSubmitting,
    error,
    clearError,
    startQuiz,
    handleAnswer,
    submitQuizResult,
  } = useQuiz(id as string, userData?.id);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const onAnswer = async (isCorrect: boolean) => {
    const isComplete = handleAnswer(isCorrect);
    if (isComplete) {
      await submitQuizResult();
    }
  };

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          clearError();
          startQuiz();
        }}
        fullScreen
      />
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No questions available
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackButton />
      <SectionTitle>Quiz</SectionTitle>
      <Text style={[styles.progress, { color: colors.text }]}>
        Question {currentIndex + 1} of {totalQuestions}
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
              onPress={() => onAnswer(index === currentQuestion.correctIndex)}
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
