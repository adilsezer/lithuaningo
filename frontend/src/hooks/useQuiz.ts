import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { setLoading } from "@redux/slices/uiSlice";
import { storeData, retrieveData, resetAllQuizKeys } from "@utils/storageUtils";
import { getCurrentDateKey } from "@utils/dateUtils";
import { QUIZ_KEYS } from "@config/constants";
import { QuizQuestion } from "@src/types";
import { useQuizQuestions } from "@hooks/useQuizQuestions";
import { useUserStats } from "@hooks/useUserStats";
import { router } from "expo-router";
import { AlertDialog } from "@components/ui/AlertDialog";

export const useQuiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const { questions, loading, error, refetchQuestions } = useQuizQuestions();
  const userData = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();
  const { updateAnswerStats } = useUserStats();

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
          refetchQuestions(savedQuestions);
          setCurrentQuestionIndex(savedProgress?.progress ?? 0);
        } else {
          await refetchQuestions();
          await storeData(QUIZ_QUESTIONS_KEY, questions);
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
      await updateAnswerStats(isCorrect);
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
    if (!userData) {
      AlertDialog.error("No user data available");
      return;
    }

    try {
      dispatch(setLoading(true));
      await resetAllQuizKeys(userData.id);
      AlertDialog.show({
        title: "Success",
        message:
          "Content reset. Redirecting to the learn tab to start a new challenge.",
        buttons: [
          { text: "OK", onPress: () => router.push("/dashboard/learn") },
        ],
      });
    } catch (error) {
      AlertDialog.error(
        error instanceof Error ? error.message : "Error resetting content"
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    currentQuestionIndex,
    showContinueButton,
    isQuizCompleted,
    questions,
    loading,
    error,
    handleAnswer,
    handleNextQuestion,
    handleRegenerateContent,
  };
};
