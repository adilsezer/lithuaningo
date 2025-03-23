import { useEffect, useState, useCallback } from "react";
import { ChallengeQuestion } from "@src/types";
import { useUserData } from "@stores/useUserStore";
import challengeService from "@src/services/data/challengeService";
import { UserChallengeStatsService } from "@src/services/data/userChallengeStatsService";

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
  const userId = userData?.id;

  // Challenge state
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

  // Reset the challenge states
  const resetChallenge = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setIsCorrectAnswer(null);
    setIsCompleted(false);
    setError(null);
  }, []);

  // Check if the user has completed today's challenge
  const checkDailyChallengeStatus = useCallback(async () => {
    if (!userId) return false;

    try {
      const isCompleted = await challengeService.hasDailyChallengeCompleted(
        userId
      );
      setDailyChallengeCompleted(isCompleted);
      return isCompleted;
    } catch (error) {
      console.error("Error checking daily challenge status:", error);
      return false;
    }
  }, [userId]);

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

      // Check if the daily challenge is already completed
      if (userId) {
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
        if (isNew) resetChallenge();

        // Fetch questions from API
        const challengeQuestions = await challengeService.getDailyChallenge();

        if (!challengeQuestions?.length) {
          setError("No questions available. Please try again later.");
          return;
        }

        setQuestions(challengeQuestions);
      } catch (err: any) {
        console.error("Failed to load challenge:", err);
        setError(
          err?.message ||
            "Failed to load challenge. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [customQuestions, resetChallenge, userId, checkDailyChallengeStatus]
  );

  // Centralized function to update user stats
  const updateUserStats = useCallback(
    async (statsUpdate: {
      todayCorrect?: number;
      todayIncorrect?: number;
      totalCorrect?: number;
      totalIncorrect?: number;
      completedChallenge?: boolean;
    }) => {
      if (!userId) return null;

      try {
        // Try to get existing stats first
        let currentStats;
        try {
          currentStats = await UserChallengeStatsService.getUserChallengeStats(
            userId
          );
        } catch (error) {
          // If stats don't exist, create them with initial values
          const createRequest = {
            userId,
            currentStreak: 0,
            longestStreak: 0,
            todayCorrectAnswers: 0,
            todayIncorrectAnswers: 0,
            totalChallengesCompleted: 0,
            totalCorrectAnswers: 0,
            totalIncorrectAnswers: 0,
          };
          currentStats =
            await UserChallengeStatsService.createUserChallengeStats(
              createRequest
            );
        }

        // Update with new values
        const updateRequest = {
          currentStreak: currentStats.currentStreak,
          longestStreak: currentStats.longestStreak,
          todayCorrectAnswers:
            currentStats.todayCorrectAnswers + (statsUpdate.todayCorrect || 0),
          todayIncorrectAnswers:
            currentStats.todayIncorrectAnswers +
            (statsUpdate.todayIncorrect || 0),
          totalChallengesCompleted:
            currentStats.totalChallengesCompleted +
            (statsUpdate.completedChallenge ? 1 : 0),
          totalCorrectAnswers:
            currentStats.totalCorrectAnswers + (statsUpdate.totalCorrect || 0),
          totalIncorrectAnswers:
            currentStats.totalIncorrectAnswers +
            (statsUpdate.totalIncorrect || 0),
        };

        await UserChallengeStatsService.updateUserChallengeStats(
          userId,
          updateRequest
        );
        return currentStats;
      } catch (error) {
        console.error("Error updating user stats:", error);
        return null;
      }
    },
    [userId]
  );

  // Handle user's answer selection
  const handleAnswer = useCallback(
    async (answer: string) => {
      const question = questions[currentIndex];
      if (!question) return;

      const isCorrect = answer === question.correctAnswer;
      setIsCorrectAnswer(isCorrect);

      if (isCorrect) setScore((prev) => prev + 1);

      // Only update stats for non-custom challenges
      if (!customQuestions && userId) {
        await updateUserStats({
          todayCorrect: isCorrect ? 1 : 0,
          todayIncorrect: !isCorrect ? 1 : 0,
          totalCorrect: isCorrect ? 1 : 0,
          totalIncorrect: !isCorrect ? 1 : 0,
        });
      }
    },
    [currentIndex, questions, userId, customQuestions, updateUserStats]
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
      if (!customQuestions && userId) {
        try {
          // Mark the daily challenge as completed
          await challengeService.setDailyChallengeCompleted(userId);
          setDailyChallengeCompleted(true);

          // Update completion stats
          await updateUserStats({
            completedChallenge: true,
          });

          // Update daily streak
          await UserChallengeStatsService.updateDailyStreak(userId);
        } catch (error) {
          console.error("Error completing challenge:", error);
          // Continue even if stats update fails
        }
      }

      setIsCompleted(true);
      if (onComplete) onComplete(score, questions.length);
    }
  }, [
    currentIndex,
    questions.length,
    userId,
    score,
    customQuestions,
    onComplete,
    updateUserStats,
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

  // Reset daily challenge status (dev only)
  const resetDailyChallenge = useCallback(async () => {
    if (!userId || !__DEV__) return;

    try {
      await challengeService.resetDailyChallengeStatus(userId);
      setDailyChallengeCompleted(false);
    } catch (error) {
      console.error("Error resetting daily challenge status:", error);
    }
  }, [userId]);

  // Load challenge questions on mount if needed
  useEffect(() => {
    if (!customQuestions && !skipInitialFetch && userId) {
      checkDailyChallengeStatus();
    }
  }, [customQuestions, skipInitialFetch, userId, checkDailyChallengeStatus]);

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
