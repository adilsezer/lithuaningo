import { useEffect, useState, useCallback } from "react";
import { ChallengeQuestion } from "@src/types";
import { useUserData } from "@stores/useUserStore";
import challengeService from "@src/services/data/challengeService";
import { useUserChallengeStats } from "@src/hooks/useUserChallengeStats";

interface UseChallengeOptions {
  customQuestions?: ChallengeQuestion[];
  onComplete?: (score: number, totalQuestions: number) => void;
  skipInitialFetch?: boolean;
}

interface UseChallengeReturn {
  questions: ChallengeQuestion[];
  currentIndex: number;
  currentQuestion: ChallengeQuestion | undefined;
  loading: boolean;
  error: string | null;
  score: number;
  isCorrectAnswer: boolean | null;
  isCompleted: boolean;
  fetchChallenge: (isNew?: boolean) => Promise<void>;
  handleAnswer: (answer: string) => Promise<void>;
  handleNextQuestion: () => Promise<void>;
  resetChallenge: () => void;
  setQuestions: (questions: ChallengeQuestion[]) => void;
  getCompletionMessage: () => string;
}

/**
 * Hook to manage challenge state, supports both daily challenges and custom questions
 *
 * @param options Optional configuration for the challenge
 * @returns State and handlers for the challenge
 */
export const useChallenge = (
  options: UseChallengeOptions = {}
): UseChallengeReturn => {
  const { customQuestions, onComplete, skipInitialFetch = false } = options;
  const userData = useUserData();
  const [questions, setQuestions] = useState<ChallengeQuestion[]>(
    customQuestions || []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!customQuestions);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    stats,
    updateStats,
    updateDailyStreak,
    incrementChallengesCompleted,
  } = useUserChallengeStats(userData?.id);

  // Load challenge questions on mount, but only if customQuestions is not provided
  // and skipInitialFetch is false
  useEffect(() => {
    if (!customQuestions && !skipInitialFetch) {
      fetchChallenge();
    }
  }, [customQuestions, skipInitialFetch]);

  // Reset the challenge states
  const resetChallenge = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setIsCorrectAnswer(null);
    setIsCompleted(false);
    setError(null);
  }, []);

  // Main function to fetch challenge questions
  const fetchChallenge = useCallback(
    async (isNew = false) => {
      // If custom questions are provided, just reset and use them
      if (customQuestions) {
        resetChallenge();
        setQuestions(customQuestions);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Reset states for new challenges
        if (isNew) {
          resetChallenge();
        }

        // Fetch questions from API
        const challengeQuestions = isNew
          ? await challengeService.generateNewChallenge()
          : await challengeService.getDailyChannel();

        if (!challengeQuestions || challengeQuestions.length === 0) {
          setError("No questions available. Please try again later.");
          return;
        }

        setQuestions(challengeQuestions);
      } catch (err: any) {
        console.error("Failed to load challenge:", err);
        const errorMessage =
          err?.message ||
          "Failed to load challenge. Please check your connection and try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [customQuestions, resetChallenge]
  );

  // Handle user's answer selection
  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!questions[currentIndex]) return;

      const currentQuestion = questions[currentIndex];
      const isCorrect = answer === currentQuestion.correctAnswer;

      setIsCorrectAnswer(isCorrect);

      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      // Only update stats for non-custom challenges and if user is logged in
      if (!customQuestions && stats && userData?.id) {
        try {
          await updateStats({
            todayCorrectAnswers: isCorrect
              ? stats.todayCorrectAnswers + 1
              : stats.todayCorrectAnswers,
            todayIncorrectAnswers: !isCorrect
              ? stats.todayIncorrectAnswers + 1
              : stats.todayIncorrectAnswers,
            totalCorrectAnswers: isCorrect
              ? stats.totalCorrectAnswers + 1
              : stats.totalCorrectAnswers,
            totalIncorrectAnswers: !isCorrect
              ? stats.totalIncorrectAnswers + 1
              : stats.totalIncorrectAnswers,
          });
        } catch (error) {
          console.error("Error updating stats:", error);
          // We don't set an error state here to avoid disrupting the user experience
        }
      }
    },
    [currentIndex, questions, stats, userData?.id, updateStats, customQuestions]
  );

  // Move to next question or complete the challenge
  const handleNextQuestion = useCallback(async () => {
    setIsCorrectAnswer(null);

    // If more questions, move to next
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
    // Otherwise complete the challenge
    else {
      // For daily challenges, update stats and submit results
      if (!customQuestions && userData?.id) {
        try {
          await Promise.all([
            challengeService.submitChallengeResult({
              userId: userData.id,
              deckId: "daily",
              score,
              totalQuestions: questions.length,
            }),
            updateDailyStreak(),
            incrementChallengesCompleted(),
          ]);
        } catch (error) {
          console.error("Error completing challenge:", error);
          // We continue to mark as completed even if saving results fails
        }
      }

      setIsCompleted(true);

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(score, questions.length);
      }
    }
  }, [
    currentIndex,
    questions.length,
    userData?.id,
    score,
    updateDailyStreak,
    incrementChallengesCompleted,
    customQuestions,
    onComplete,
  ]);

  // Get feedback message based on score
  const getCompletionMessage = useCallback(() => {
    const percentage =
      questions.length > 0 ? (score / questions.length) * 100 : 0;

    if (percentage >= 90)
      return "Puiku! (Excellent!) Your Lithuanian skills are impressive!";
    if (percentage >= 75)
      return "Labai gerai! (Very good!) You're making great progress!";
    if (percentage >= 60)
      return "Gerai! (Good!) Keep practicing to improve your skills.";
    if (percentage >= 40)
      return "Neblogai. (Not bad.) More practice will help you improve.";
    return "Keep learning! Practice makes perfect in Lithuanian.";
  }, [score, questions.length]);

  return {
    questions,
    currentIndex,
    currentQuestion: questions[currentIndex],
    loading,
    error,
    score,
    isCorrectAnswer,
    isCompleted,
    fetchChallenge,
    handleAnswer,
    handleNextQuestion,
    resetChallenge,
    setQuestions,
    getCompletionMessage,
  };
};
