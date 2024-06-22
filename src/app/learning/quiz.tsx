import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import { setLoading } from "@src/redux/slices/uiSlice";
import MultipleChoiceQuiz from "@components/MultipleChoiceQuiz";
import FillInTheBlankQuiz from "@components/FillInTheBlankQuiz";
import CustomButton from "@components/CustomButton";
import CompletedScreen from "@components/CompletedScreen";
import { storeData } from "@utils/storageUtil";
import { getCurrentDateKey } from "@utils/dateUtils";
import useData from "../../hooks/useData";
import {
  loadQuizData,
  loadQuestion,
  QuizState,
  initializeQuizState,
} from "@utils/learningUtils";
import BackButton from "@components/BackButton";

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
      dispatch(setLoading(true));
      loadQuizData(userData, dispatch, setQuizState, QUIZ_PROGRESS_KEY).finally(
        () => {
          dispatch(setLoading(false));
        }
      );
    }
  }, [userData, dispatch]);

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

    setQuizState((prev) => ({
      ...prev,
      showContinueButton: true,
    }));
    storeData(QUIZ_PROGRESS_KEY, quizState.questionIndex + 1);
  };

  const handleContinue = () => {
    setQuizState((prev) => ({
      ...prev,
      questionIndex: quizState.questionIndex + 1,
    }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {quizState.quizCompleted ? (
          <View>
            <CompletedScreen
              displayText="You have completed today's session!"
              buttonText="Go to Leaderboard"
              navigationRoute="/dashboard/leaderboard"
              showStats={true}
            />
          </View>
        ) : (
          <View>
            <BackButton />
            <Text
              style={[globalStyles.subtitle, { color: globalColors.primary }]}
            >
              {quizState.questionIndex + 1} /{" "}
              {quizState.similarSentences.length} Questions Complete
            </Text>
            {quizState.questionType === "multipleChoice" ||
            quizState.questionType === "trueFalse" ? (
              <MultipleChoiceQuiz
                questionText={quizState.questionText}
                sentenceText={quizState.sentenceText}
                options={quizState.options}
                correctAnswerText={quizState.correctAnswerText}
                translation={quizState.translation}
                image={quizState.image}
                questionIndex={quizState.questionIndex}
                onAnswer={handleAnswer}
              />
            ) : (
              <FillInTheBlankQuiz
                questionText={quizState.questionText}
                sentenceText={quizState.sentenceText}
                correctAnswerText={quizState.correctAnswerText}
                translation={quizState.translation}
                image={quizState.image}
                questionIndex={quizState.questionIndex}
                onAnswer={handleAnswer}
              />
            )}
            {quizState.showContinueButton && (
              <CustomButton title="Continue" onPress={handleContinue} />
            )}
          </View>
        )}
      </ScrollView>
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
