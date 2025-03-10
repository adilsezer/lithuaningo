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
  dailyChallengeCompleted: boolean;
  checkDailyChallengeStatus: () => Promise<boolean>;
  resetDailyChallenge: () => Promise<void>;
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
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);

  const { stats, updateStats, createStats } = useUserChallengeStats(
    userData?.id
  );

  // Check if the user has completed today's challenge
  const checkDailyChallengeStatus = useCallback(async () => {
    if (!userData?.id) return false;

    try {
      const isCompleted = await challengeService.hasDailyChallengeCompleted(
        userData.id
      );
      setDailyChallengeCompleted(isCompleted);
      return isCompleted;
    } catch (error) {
      console.error("Error checking daily challenge status:", error);
      return false;
    }
  }, [userData?.id]);

  // Load challenge questions on mount, but only if customQuestions is not provided
  // and skipInitialFetch is false
  useEffect(() => {
    if (!customQuestions && !skipInitialFetch) {
      const init = async () => {
        // Check if the daily challenge is already completed
        if (!userData?.id || customQuestions) return;

        await checkDailyChallengeStatus();
        // Removed automatic fetchChallenge here as we'll do it in the Challenge screen
      };

      init();
    }
  }, [customQuestions, skipInitialFetch, userData?.id]);

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

      // Check if the daily challenge is already completed (for non-custom challenges)
      if (!customQuestions && userData?.id) {
        const isCompleted = await checkDailyChallengeStatus();
        if (isCompleted) {
          setError(
            "You've already completed today's challenge. Come back tomorrow for a new one!"
          );
          setLoading(false);
          return;
        }
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
    [customQuestions, resetChallenge, userData?.id, checkDailyChallengeStatus]
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
      if (!customQuestions && userData?.id) {
        try {
          if (!stats) {
            // If stats don't exist yet, check if they really don't exist before creating
            try {
              await createStats();
            } catch (error) {
              console.error("Error handling user challenge stats:", error);
              // Continue with the challenge even if stats creation fails
            }
            return;
          }

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
    [
      currentIndex,
      questions,
      stats,
      userData?.id,
      updateStats,
      customQuestions,
      createStats,
    ]
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
      // For non-custom challenges, update stats and submit results
      if (!customQuestions && userData?.id) {
        try {
          // Mark the daily challenge as completed
          // For non-custom challenges, always mark as daily challenge
          await challengeService.setDailyChallengeCompleted(userData.id);
          setDailyChallengeCompleted(true);
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
    questions,
    userData?.id,
    score,
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

  // Reset daily challenge status
  const resetDailyChallenge = useCallback(async () => {
    if (!userData?.id) return;

    try {
      // Only allow reset in development mode
      if (!__DEV__) {
        console.warn(
          "Reset daily challenge is only available in development mode"
        );
        return;
      }

      // Reset the status in storage
      await challengeService.resetDailyChallengeStatus(userData.id);

      // Update local state
      setDailyChallengeCompleted(false);

      // Log success
      console.log("Daily challenge status has been reset");
    } catch (error) {
      console.error("Error resetting daily challenge status:", error);
    }
  }, [userData?.id]);

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
    dailyChallengeCompleted,
    checkDailyChallengeStatus,
    resetDailyChallenge,
  };
};
