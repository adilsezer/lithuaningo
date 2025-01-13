import React, { useRef } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import MultipleChoiceQuestion from "@components/learning/MultipleChoiceQuestion";
import FillInTheBlankQuiz from "@components/learning/FillInTheBlank";
import CustomButton from "@components/ui/CustomButton";
import CompletedLayout from "@components/learning/CompletedLayout";
import BackButton from "@components/layout/BackButton";
import { SectionText } from "@components/typography";
import ErrorMessage from "@components/ui/ErrorMessage";
import { useQuiz } from "@hooks/useQuiz";

const QuizScreen: React.FC = () => {
  const {
    currentQuestionIndex,
    showContinueButton,
    isQuizCompleted,
    questions,
    loading,
    error,
    handleAnswer,
    handleNextQuestion,
  } = useQuiz();

  const { colors } = useThemeStyles();
  const scrollViewRef = useRef<ScrollView>(null);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (isQuizCompleted) {
    return (
      <View>
        <CompletedLayout
          title="Congratulations! You've Completed Today's Session!"
          subtitle="Return tomorrow for a new set of challenges!"
          buttonText="Go to Leaderboard"
          navigationRoute="/dashboard/leaderboard"
          showStats={true}
        />
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const commonProps = {
    questionIndex: currentQuestionIndex,
    onAnswer: handleAnswer,
    sentenceText: currentQuestion.question,
    questionText: "Choose the correct translation:",
    questionWord: currentQuestion.options[currentQuestion.correctIndex],
    correctAnswerText: currentQuestion.options[currentQuestion.correctIndex],
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView ref={scrollViewRef}>
        <View style={{ flex: 1 }}>
          <BackButton />
          <SectionText style={{ color: colors.primary }}>
            {`${currentQuestionIndex + 1} / ${
              questions.length
            } Questions Complete`}
          </SectionText>

          {questions.length > 0 && currentQuestionIndex < questions.length && (
            <MultipleChoiceQuestion
              {...commonProps}
              options={currentQuestion.options}
              image=""
            />
          )}
        </View>
      </ScrollView>
      {showContinueButton && (
        <CustomButton title="Next Question" onPress={handleNextQuestion} />
      )}
    </KeyboardAvoidingView>
  );
};

export default QuizScreen;
