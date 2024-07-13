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
import { storeData, retrieveData } from "@utils/storageUtils";
import { getCurrentDateKey } from "@utils/dateUtils";
import useData from "../../hooks/useData";
import {
  loadQuizData,
  loadQuestion,
  initializeQuizState,
} from "../../engine/quizEngine";
import BackButton from "@components/BackButton";
import { QuizState } from "../../state/quizState";
import { Sentence } from "../../services/data/sentenceService";
import crashlytics from "@react-native-firebase/crashlytics"; // Import Crashlytics

const QuizScreen: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>(initializeQuizState());
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [incorrectQuestions, setIncorrectQuestions] = useState<Sentence[]>([]);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
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
        setSentences,
        setQuizState,
        QUIZ_PROGRESS_KEY
      ).finally(() => {
        dispatch(setLoading(false));
      });
    }
  }, [userData, dispatch]);

  useEffect(() => {
    if (sentences.length > 0) {
      if (quizState.questionIndex < sentences.length) {
        loadQuestion(
          sentences[quizState.questionIndex],
          setQuizState,
          userData
        );
        setQuizState((prev: QuizState) => ({ ...prev, quizCompleted: false }));
      } else {
        setQuizState((prev: QuizState) => ({ ...prev, quizCompleted: true }));
      }
    }
  }, [quizState.questionIndex, sentences, userData]);

  const handleAnswer = async (isCorrect: boolean) => {
    const timeSpent = 1;
    try {
      if (
        quizState.questionIndex < sentences.length &&
        !quizState.quizCompleted
      ) {
        await updateStats(isCorrect, timeSpent);
      }

      if (isCorrect) {
        setCorrectAnswersCount((prevCount) => prevCount + 1);
      } else {
        // Add incorrect question to the end of the queue
        setIncorrectQuestions((prev) => [
          ...prev,
          sentences[quizState.questionIndex],
        ]);
      }

      setQuizState((prev: QuizState) => ({
        ...prev,
        showContinueButton: true,
      }));
      storeData(QUIZ_PROGRESS_KEY, quizState.questionIndex + 1);
    } catch (error: unknown) {
      crashlytics().recordError(error as Error); // Type assertion
      console.error("Error updating stats:", error);
    }
  };

  const handleNextQuestion = () => {
    if (quizState.questionIndex < sentences.length - 1) {
      setQuizState((prev: QuizState) => ({
        ...prev,
        questionIndex: quizState.questionIndex + 1,
        showContinueButton: false,
      }));
    } else if (incorrectQuestions.length > 0) {
      // Move to the next round with incorrect questions
      setSentences(incorrectQuestions);
      setIncorrectQuestions([]);
      setQuizState((prev: QuizState) => ({
        ...prev,
        questionIndex: 0,
        showContinueButton: false,
      }));
    } else {
      setQuizState((prev: QuizState) => ({
        ...prev,
        quizCompleted: true,
      }));
    }
  };

  useEffect(() => {
    crashlytics().log("Quiz screen loaded.");
  }, []);

  const isQuizCompleted =
    quizState.quizCompleted && quizState.questionIndex >= sentences.length;
  const allAnswersCorrect = correctAnswersCount >= sentences.length;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {isQuizCompleted ? (
          <View>
            {allAnswersCorrect ? (
              <CompletedScreen
                title="Congratulations! You've Completed Today's Session!"
                subtitle="Return tomorrow for a new set of challenges!"
                buttonText="Go to Leaderboard"
                navigationRoute="/dashboard/leaderboard"
                showStats={true}
              />
            ) : (
              <CompletedScreen
                title="You need to answer all questions correctly to complete the day!"
                subtitle="Try again!"
                buttonText="Retry"
                navigationRoute="/quiz"
                showStats={false}
              />
            )}
          </View>
        ) : (
          <View>
            <BackButton />
            <Text
              style={[globalStyles.subtitle, { color: globalColors.primary }]}
            >
              {quizState.questionIndex + 1} / {sentences.length} Questions
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
