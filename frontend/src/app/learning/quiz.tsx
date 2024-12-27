import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { setLoading } from "@redux/slices/uiSlice";
import MultipleChoiceQuiz from "@components/learning/MultipleChoiceQuiz";
import FillInTheBlankQuiz from "@components/learning/FillInTheBlank";
import CustomButton from "@components/ui/CustomButton";
import CompletedLayout from "@components/learning/CompletedLayout";
import { storeData, retrieveData, resetAllQuizKeys } from "@utils/storageUtils";
import { getCurrentDateKey } from "@utils/dateUtils";
import BackButton from "@components/layout/BackButton";
import { QUIZ_KEYS } from "@config/constants";
import { router } from "expo-router";
import { QuizQuestion } from "@src/types";
import { generateQuiz } from "@services/data/quizService";
import { useAnswerHandler } from "@src/hooks/useAnswerHandler";

const QuizScreen: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();
  const updateStats = useAnswerHandler();
  const scrollViewRef = useRef<ScrollView>(null);

  const getStorageKey = (
    keyFunc: (userId: string, dateKey: string) => string
  ) => (userData ? keyFunc(userData.id, getCurrentDateKey()) : "");

  const QUIZ_QUESTIONS_KEY = getStorageKey(QUIZ_KEYS.QUIZ_QUESTIONS_KEY);
  const QUIZ_PROGRESS_KEY = getStorageKey(QUIZ_KEYS.QUIZ_PROGRESS_KEY);

  useEffect(() => {
    const initializeQuiz = async () => {
      if (!userData) return;

      dispatch(setLoading(true));
      try {
        const savedProgress = await retrieveData<{ progress: number }>(
          QUIZ_PROGRESS_KEY
        );
        const savedQuestions = await retrieveData<QuizQuestion[]>(
          QUIZ_QUESTIONS_KEY
        );

        if (savedQuestions?.length) {
          setQuestions(savedQuestions);
          setCurrentQuestionIndex(savedProgress?.progress ?? 0);
        } else {
          const newQuestions = await generateQuiz(userData.id);
          setQuestions(newQuestions);
          await storeData(QUIZ_QUESTIONS_KEY, newQuestions);
        }
      } catch (error) {
        console.error("Error initializing quiz:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeQuiz();
  }, [userData]);

  useEffect(() => {
    if (questions.length && currentQuestionIndex >= questions.length) {
      setIsQuizCompleted(true);
    }
  }, [currentQuestionIndex, questions]);

  const handleAnswer = async (isCorrect: boolean) => {
    try {
      await storeData(QUIZ_PROGRESS_KEY, {
        progress: currentQuestionIndex + 1,
      });
      await updateStats(isCorrect);
      setShowContinueButton(true);
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
    setShowContinueButton(false);
  };

  const handleRegenerateContent = async () => {
    if (!userData) return;

    try {
      dispatch(setLoading(true));
      await resetAllQuizKeys(userData.id);
      Alert.alert(
        "Success",
        "Content reset. Redirecting to the learn tab to start a new challenge.",
        [{ text: "OK", onPress: () => router.push("/dashboard/learn") }]
      );
    } catch (error) {
      console.error("Error resetting content:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView ref={scrollViewRef}>
        <View style={{ flex: 1 }}>
          <BackButton />
          <Text
            style={[globalStyles.subtitle, { color: globalColors.primary }]}
          >
            {`${currentQuestionIndex + 1} / ${
              questions.length
            } Questions Complete`}
          </Text>

          {questions.length > 0 &&
            currentQuestionIndex < questions.length &&
            (questions[currentQuestionIndex].questionType ===
              "MultipleChoice" ||
            questions[currentQuestionIndex].questionType ===
              "FillInTheBlank" ? (
              <MultipleChoiceQuiz
                questionWord={""}
                correctAnswerText={""}
                {...questions[currentQuestionIndex]}
                questionIndex={currentQuestionIndex}
                onAnswer={handleAnswer}
                image={questions[currentQuestionIndex].image || ""}
              />
            ) : (
              <FillInTheBlankQuiz
                questionWord={""}
                translation={""}
                correctAnswerText={""}
                {...questions[currentQuestionIndex]}
                questionIndex={currentQuestionIndex}
                onAnswer={handleAnswer}
                image={questions[currentQuestionIndex].image || ""}
              />
            ))}
        </View>
      </ScrollView>
      {showContinueButton && (
        <CustomButton title="Next Question" onPress={handleNextQuestion} />
      )}
    </KeyboardAvoidingView>
  );
};

export default QuizScreen;
