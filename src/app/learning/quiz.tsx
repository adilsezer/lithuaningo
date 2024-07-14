import React, { useEffect, useState } from "react";
import {
  View,
  Text,
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
import { storeData } from "@utils/storageUtils";
import { getCurrentDateKey } from "@utils/dateUtils";
import useData from "../../hooks/useData";
import {
  loadQuizData,
  initializeQuizState,
  QuizQuestion,
} from "../../engine/quizEngine";
import BackButton from "@components/BackButton";
import { QuizState } from "../../state/quizState";
import crashlytics from "@react-native-firebase/crashlytics"; // Import Crashlytics

const QuizScreen: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>(initializeQuizState());
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
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
      loadQuizData(
        userData,
        setQuestions,
        setQuizState,
        QUIZ_PROGRESS_KEY
      ).finally(() => {
        dispatch(setLoading(false));
      });
    }
  }, [userData, dispatch]);

  useEffect(() => {
    if (questions.length > 0 && quizState.questionIndex < questions.length) {
      console.log(
        "Current Question:",
        questions[quizState.questionIndex].questionText
      );
      setQuizState((prev: QuizState) => ({
        ...prev,
        quizCompleted: false,
        ...questions[quizState.questionIndex],
      }));
    } else if (questions.length > 0) {
      setQuizState((prev: QuizState) => ({ ...prev, quizCompleted: true }));
    }
  }, [quizState.questionIndex, questions]);

  const handleAnswer = async (isCorrect: boolean) => {
    const timeSpent = 1;
    try {
      await updateStats(isCorrect, timeSpent);

      setQuizState((prev: QuizState) => ({
        ...prev,
        showContinueButton: true,
      }));
      await storeData(QUIZ_PROGRESS_KEY, quizState.questionIndex + 1);
      console.log("Answer submitted:", {
        isCorrect,
        questionIndex: quizState.questionIndex,
      });
    } catch (error: unknown) {
      crashlytics().recordError(error as Error); // Type assertion
      console.error("Error updating stats:", error);
    }
  };

  const handleNextQuestion = () => {
    console.log("Moving to next question");
    setQuizState((prev: QuizState) => ({
      ...prev,
      questionIndex: quizState.questionIndex + 1,
      showContinueButton: false,
    }));
  };

  useEffect(() => {
    crashlytics().log("Quiz screen loaded.");
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {quizState.quizCompleted ? (
          <View>
            <CompletedScreen
              title="Congratulations! You've Completed Today's Session!"
              subtitle="Return tomorrow for a new set of challenges!"
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
              {quizState.questionIndex + 1} / {questions.length} Questions
              Complete
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
              <CustomButton
                title="Next Question"
                onPress={handleNextQuestion}
              />
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default QuizScreen;
