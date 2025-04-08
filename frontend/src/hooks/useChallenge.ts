import { useState, useCallback, useEffect } from "react";
import { ChallengeQuestionResponse } from "@src/types";
import challengeService from "@src/services/data/challengeService";

/**
 * Simple hook for challenge functionality
 */
export function useChallenge(customQuestions?: ChallengeQuestionResponse[]) {
  // Core state
  const [questions, setQuestions] = useState<ChallengeQuestionResponse[]>(
    customQuestions || []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current question based on index
  const currentQuestion = questions[currentIndex];

  // Fetch questions from API
  const fetchQuestions = useCallback(async () => {
    if (customQuestions) {
      setQuestions(customQuestions);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await challengeService.getDailyChallengeQuestions();

      if (!data?.length) {
        setError("No questions available");
        return;
      }

      setQuestions(data);
    } catch (err) {
      setError("Failed to load questions");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [customQuestions]);

  // Handle answer selection
  const handleAnswer = useCallback(
    (answer: string) => {
      if (!currentQuestion || isAnswered) return;

      const correct = answer === currentQuestion.correctAnswer;
      setIsCorrect(correct);
      setIsAnswered(true);

      if (correct) {
        setScore((prev) => prev + 1);
      }
    },
    [currentQuestion, isAnswered]
  );

  // Move to next question or complete
  const handleNextQuestion = useCallback(() => {
    setIsAnswered(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, questions.length]);

  // Reset the challenge
  const resetChallenge = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setIsAnswered(false);
    setIsCorrect(false);
    setIsCompleted(false);
  }, []);

  // Get completion message
  const getCompletionMessage = useCallback(() => {
    const percentage =
      questions.length > 0 ? (score / questions.length) * 100 : 0;

    if (percentage >= 80)
      return "Excellent! Your Lithuanian skills are impressive!";
    if (percentage >= 60) return "Good job! You're making progress.";
    return "Keep practicing to improve your Lithuanian skills.";
  }, [score, questions.length]);

  // Load questions on mount
  useEffect(() => {
    if (!customQuestions) {
      fetchQuestions();
    }
  }, [customQuestions, fetchQuestions]);

  return {
    // State
    questions,
    currentQuestion,
    currentIndex,
    score,
    isAnswered,
    isCorrect,
    isCompleted,
    isLoading,
    error,

    // Actions
    handleAnswer,
    handleNextQuestion,
    resetChallenge,
    fetchQuestions,

    // Helpers
    getCompletionMessage,

    // Extra
    totalQuestions: questions.length,
    progress: questions.length ? (currentIndex + 1) / questions.length : 0,
  };
}
