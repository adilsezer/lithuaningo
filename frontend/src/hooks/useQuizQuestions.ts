import { useState, useEffect } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { QuizQuestion } from "@src/types";
import { generateQuiz } from "@services/data/quizService";

export const useQuizQuestions = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userData = useAppSelector(selectUserData);

  const fetchQuestions = async (savedQuestions?: QuizQuestion[]) => {
    try {
      if (savedQuestions) {
        setQuestions(savedQuestions);
        return;
      }

      if (!userData?.id) {
        throw new Error("No user ID available");
      }
      setLoading(true);
      const newQuestions = await generateQuiz(userData.id);
      setQuestions(newQuestions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch quiz questions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [userData?.id]);

  return { questions, loading, error, refetchQuestions: fetchQuestions };
};
