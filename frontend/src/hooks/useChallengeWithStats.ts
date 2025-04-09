import { useState, useCallback, useEffect } from "react";
import {
  ChallengeQuestionResponse,
  UserChallengeStatsResponse,
  SubmitChallengeAnswerRequest,
} from "@src/types";
import challengeService from "@src/services/data/challengeService";
import { UserChallengeStatsService } from "@src/services/data/userChallengeStatsService";

/**
 * Comprehensive hook for managing daily challenges with stats integration
 * Handles both UI challenge state and backend user stats
 */
export function useChallengeWithStats(userId?: string) {
  // Challenge UI state
  const [questions, setQuestions] = useState<ChallengeQuestionResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User stats state
  const [stats, setStats] = useState<UserChallengeStatsResponse | null>(null);

  // Derived state
  const currentQuestion = questions[currentIndex];
  const isCompleted = currentIndex >= questions.length;
  const isAnswered = currentIndex < questions.length;

  // Load challenge questions
  const getDailyChallengeQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await challengeService.getDailyChallengeQuestions();
      setQuestions(data);
    } catch (err) {
      setError("Failed to load questions");
      console.error("[useChallengeWithStats] Error loading questions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get user's challenge stats
  const getUserChallengeStats = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await UserChallengeStatsService.getUserChallengeStats(
        userId
      );
      setStats(data);
    } catch (err) {
      setError("Failed to fetch challenge stats");
      console.error("[useChallengeWithStats] Error fetching stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await getDailyChallengeQuestions();
        if (userId) {
          await getUserChallengeStats();
        }
      } catch (err) {
        console.error("[useChallengeWithStats] Initial load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getDailyChallengeQuestions, getUserChallengeStats, userId]);

  // Submit answer to current question and update UI and stats
  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!currentQuestion || !isAnswered) return;

      // Check if answer is correct
      const isCorrect = answer === currentQuestion.correctAnswer;

      // Update local score
      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      // Move to next question in UI
      setCurrentIndex((prev) => prev + 1);

      // Submit to backend if user is logged in
      if (userId) {
        try {
          const request: SubmitChallengeAnswerRequest = {
            challengeId: currentQuestion.id,
            wasCorrect: isCorrect,
            userId,
          };

          const updatedStats =
            await UserChallengeStatsService.submitChallengeAnswer(request);
          setStats(updatedStats);
        } catch (err) {
          console.error(
            "[useChallengeWithStats] Error submitting answer to backend:",
            err
          );
          // Don't set error state here as it would disrupt the UI flow
        }
      }
    },
    [currentQuestion, isAnswered, userId]
  );

  // Reset the challenge
  const resetChallenge = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
  }, []);

  return {
    // Challenge state
    questions,
    currentQuestion,
    currentIndex,
    score,
    isAnswered,
    isCompleted,

    // Stats state
    stats,

    // Loading state
    isLoading,
    error,

    // Actions
    submitAnswer,
    resetChallenge,
    getDailyChallengeQuestions,
    getUserChallengeStats,

    // Helpers
    totalQuestions: questions.length,
    progress: questions.length ? (currentIndex + 1) / questions.length : 0,
  };
}
