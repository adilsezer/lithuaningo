import { useEffect, useState, useCallback } from "react";
import { ChallengeQuestion } from "@src/types";
import { useUserData } from "@stores/useUserStore";
import challengeService from "@src/services/data/challengeService";
import { useUserChallengeStats } from "@src/hooks/useUserChallengeStats";
import { UserChallengeStatsService } from "@src/services/data/userChallengeStatsService";

interface UseChallengeOptions {
  customQuestions?: ChallengeQuestion[];
  onComplete?: (score: number, totalQuestions: number) => void;
  skipInitialFetch?: boolean;
  deckId?: string;
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
  fetchDeckChallenge: (deckId: string) => Promise<void>;
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
  const {
    customQuestions,
    onComplete,
    skipInitialFetch = false,
    deckId,
  } = options;
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

  // Function to fetch latest stats
  const fetchStats = useCallback(async () => {
    if (!userData?.id) return;
    try {
      const freshStats = await UserChallengeStatsService.getUserChallengeStats(
        userData.id
      );
    } catch (error) {
      console.error(`[useChallenge] Error fetching stats:`, error);
    }
  }, [userData?.id]);

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

  // Fetch deck-specific challenge questions
  const fetchDeckChallenge = useCallback(
    async (deckId: string) => {
      if (!deckId) {
        setError("No deck ID provided.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        resetChallenge(); // Reset state for new challenge

        // Fetch deck-specific questions
        const deckQuestions = await challengeService.generateDeckChallenge(
          deckId
        );

        if (!deckQuestions || deckQuestions.length === 0) {
          setError(
            "No questions could be generated for this deck. Make sure the deck has flashcards."
          );
          return;
        }

        setQuestions(deckQuestions);
      } catch (err: any) {
        console.error(`Failed to load deck challenge for deck ${deckId}:`, err);
        const errorMessage =
          err?.message ||
          "Failed to load deck challenge. Please check your connection and try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [resetChallenge]
  );

  // Handle user's answer selection
  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!questions[currentIndex]) {
        return;
      }

      const currentQuestion = questions[currentIndex];
      const isCorrect = answer === currentQuestion.correctAnswer;

      setIsCorrectAnswer(isCorrect);

      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      // Only update stats for non-custom challenges and if user is logged in
      if (!customQuestions && userData?.id) {
        try {
          // STEP 1: EXPLICITLY CREATE STATS FIRST (This will return existing stats if they already exist)

          const createRequest = {
            userId: userData.id,
            currentStreak: 0,
            longestStreak: 0,
            todayCorrectAnswers: 0,
            todayIncorrectAnswers: 0,
            totalChallengesCompleted: 0,
            totalCorrectAnswers: 0,
            totalIncorrectAnswers: 0,
          };

          const createdOrExistingStats =
            await UserChallengeStatsService.createUserChallengeStats(
              createRequest
            );

          // STEP 2: NOW UPDATE WITH INCREMENTED VALUES
          // Use the retrieved stats to ensure we have the correct base values
          const updatedStats = {
            currentStreak: createdOrExistingStats.currentStreak,
            longestStreak: createdOrExistingStats.longestStreak,
            todayCorrectAnswers:
              createdOrExistingStats.todayCorrectAnswers + (isCorrect ? 1 : 0),
            todayIncorrectAnswers:
              createdOrExistingStats.todayIncorrectAnswers +
              (!isCorrect ? 1 : 0),
            totalChallengesCompleted:
              createdOrExistingStats.totalChallengesCompleted,
            totalCorrectAnswers:
              createdOrExistingStats.totalCorrectAnswers + (isCorrect ? 1 : 0),
            totalIncorrectAnswers:
              createdOrExistingStats.totalIncorrectAnswers +
              (!isCorrect ? 1 : 0),
          };

          // Use the regular update method since we KNOW the stats exist now
          await UserChallengeStatsService.updateUserChallengeStats(
            userData.id,
            updatedStats
          );

          // Update local state
          await fetchStats();
        } catch (error) {
          // Continue with the challenge even if stats update fails
        }
      }
    },
    [currentIndex, questions, score, userData?.id, customQuestions, fetchStats]
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
          // Step 1: Mark the daily challenge as completed
          await challengeService.setDailyChallengeCompleted(userData.id);
          setDailyChallengeCompleted(true);

          // Step 2: Update challenge completion stats directly
          try {
            // Create a direct update request with the completion data

            // Get current stats if they exist (for reference only, not dependent on them)
            let currentStats;
            try {
              currentStats =
                await UserChallengeStatsService.getUserChallengeStats(
                  userData.id
                );
            } catch (error) {}

            // Create a new stats object if none exists
            if (!currentStats) {
              const createRequest = {
                userId: userData.id,
                currentStreak: 0,
                longestStreak: 0,
                todayCorrectAnswers: score,
                todayIncorrectAnswers: questions.length - score,
                totalChallengesCompleted: 1,
                totalCorrectAnswers: score,
                totalIncorrectAnswers: questions.length - score,
              };

              await UserChallengeStatsService.createUserChallengeStats(
                createRequest
              );
            }
            // If stats exist, update them with explicit values
            else {
              const updateRequest = {
                currentStreak: currentStats.currentStreak,
                longestStreak: currentStats.longestStreak,
                // Explicitly update with the new totals - don't rely on increments
                todayCorrectAnswers: currentStats.todayCorrectAnswers + score,
                todayIncorrectAnswers:
                  currentStats.todayIncorrectAnswers +
                  (questions.length - score),
                totalChallengesCompleted:
                  currentStats.totalChallengesCompleted + 1,
                totalCorrectAnswers: currentStats.totalCorrectAnswers + score,
                totalIncorrectAnswers:
                  currentStats.totalIncorrectAnswers +
                  (questions.length - score),
              };

              await UserChallengeStatsService.updateUserChallengeStats(
                userData.id,
                updateRequest
              );
            }

            // Step 3: Update daily streak
            await UserChallengeStatsService.updateDailyStreak(userData.id);
          } catch (error) {
            console.error(`[useChallenge] Error updating stats:`, error);
            // Continue with the challenge even if stats update fails
          }
        } catch (error) {
          console.error(`[useChallenge] Error completing challenge:`, error);
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
    } catch (error) {
      console.error("Error resetting daily challenge status:", error);
    }
  }, [userData?.id]);

  // Return the hook's API
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
    fetchDeckChallenge,
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
