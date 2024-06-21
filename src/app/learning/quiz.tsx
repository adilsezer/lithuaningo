import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import { setLoading } from "@src/redux/slices/uiSlice";
import MultipleChoiceQuiz from "@components/MultipleChoiceQuiz";
import FillInTheBlankQuiz from "@components/FillInTheBlankQuiz";
import CustomButton from "@components/CustomButton";
import CompletedScreen from "@components/CompletedScreen";
import { storeData, clearData } from "@utils/storageUtil";
import { getCurrentDateKey } from "@utils/dateUtils";
import useData from "../../hooks/useData";
import {
  loadQuizData,
  loadQuestion,
  QuizState,
  initializeQuizState,
} from "@utils/learningUtils";

const QuizScreen: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>(initializeQuizState());
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();
  const { handleAnswer: updateStats } = useData();

  const QUIZ_PROGRESS_KEY = `quizProgress_${
    userData?.id
  }_${getCurrentDateKey()}`;

  useEffect(() => {
    if (userData) {
      loadQuizData(
        userData,
        dispatch,
        setLoading,
        setQuizState,
        QUIZ_PROGRESS_KEY
      );
    }
  }, [userData]);

  useEffect(() => {
    if (
      quizState.similarSentences.length > 0 &&
      quizState.questionIndex < quizState.similarSentences.length
    ) {
      loadQuestion(
        quizState.similarSentences[quizState.questionIndex],
        setQuizState
      );
      setQuizState((prev) => ({ ...prev, quizCompleted: false }));
    } else if (quizState.questionIndex >= quizState.similarSentences.length) {
      setQuizState((prev) => ({ ...prev, quizCompleted: true }));
    }
  }, [quizState.questionIndex, quizState.similarSentences]);

  const handleAnswer = async (isCorrect: boolean) => {
    const timeSpent = 0.5;
    await updateStats(isCorrect, timeSpent);

    setQuizState((prev) => ({ ...prev, showContinueButton: true }));
  };

  const handleContinue = () => {
    const nextIndex = quizState.questionIndex + 1;
    setQuizState((prev) => ({ ...prev, questionIndex: nextIndex }));
    storeData(QUIZ_PROGRESS_KEY, nextIndex);
  };

  const handleClearCompletionStatus = async () => {
    await clearData(QUIZ_PROGRESS_KEY);
    setQuizState((prev) => ({ ...prev, quizCompleted: false }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {quizState.quizCompleted ? (
        <View>
          <CompletedScreen
            displayText="You have completed today's session!"
            buttonText="Go to Leaderboard"
            navigationRoute="/dashboard/leaderboard"
          />
          <CustomButton
            title="Clear Completion Status"
            onPress={handleClearCompletionStatus}
            style={{
              backgroundColor: "red",
              marginTop: 20,
              alignSelf: "center",
            }}
          />
        </View>
      ) : (
        <View>
          <Text
            style={[globalStyles.subtitle, { color: globalColors.primary }]}
          >
            {quizState.questionIndex + 1} / {quizState.similarSentences.length}{" "}
            Questions Complete
          </Text>
          {quizState.quizType === "multipleChoice" ||
          quizState.quizType === "trueFalse" ? (
            <MultipleChoiceQuiz
              question={quizState.question}
              quizText={quizState.quizText}
              options={quizState.options}
              correctAnswer={quizState.correctAnswer}
              translation={quizState.translation}
              image={quizState.image}
              onAnswer={handleAnswer}
            />
          ) : (
            <FillInTheBlankQuiz
              question={quizState.question}
              quizText={quizState.quizText}
              correctAnswer={quizState.correctAnswer}
              translation={quizState.translation}
              image={quizState.image}
              onAnswer={handleAnswer}
            />
          )}
          {quizState.showContinueButton && (
            <CustomButton title="Continue" onPress={handleContinue} />
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default QuizScreen;
