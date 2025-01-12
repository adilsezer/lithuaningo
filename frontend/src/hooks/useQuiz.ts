import { useState, useCallback } from "react";
import { QuizQuestion } from "@src/types";
import quizService from "@services/data/quizService";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setLoading, selectIsLoading } from "@redux/slices/uiSlice";
import { AlertDialog } from "@components/ui/AlertDialog";

export const useQuiz = (deckId: string) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startQuiz = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await quizService.startQuiz(deckId);
      setQuestions(data);
      setError(null);
      return data;
    } catch (err) {
      setError("Failed to start quiz. Please try again.");
      console.error("Error starting quiz:", err);
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, deckId]);

  const submitQuizResult = useCallback(
    async (userId: string, score: number, totalQuestions: number) => {
      try {
        setIsSubmitting(true);
        await quizService.submitQuizResult({
          deckId,
          userId,
          score,
          totalQuestions,
        });
        AlertDialog.success(
          `Quiz completed! Score: ${score}/${totalQuestions}`
        );
      } catch (err) {
        AlertDialog.error("Failed to save quiz results");
        console.error("Error submitting quiz results:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [deckId]
  );

  return {
    questions,
    isLoading,
    error,
    isSubmitting,
    startQuiz,
    submitQuizResult,
  };
};
