import { useState, useCallback, useRef } from "react";
import {
  UserFlashcardStatsSummaryResponse,
  SubmitFlashcardAnswerRequest,
  UserFlashcardStatResponse,
} from "@src/types/UserFlashcardStats";
import { UserFlashcardStatsService } from "@services/data/userFlashcardStatsService";

interface UseFlashcardStatsProps {
  autoRefreshDetails?: boolean;
}

/**
 * Hook for managing flashcard statistics
 *
 * Provides functionality for:
 * - Fetching summary statistics for a user
 * - Fetching detailed statistics for a specific flashcard
 * - Submitting answers for flashcards
 */
export const useFlashcardStats = (
  userId?: string,
  options: UseFlashcardStatsProps = {}
) => {
  // Stats data
  const [statsSummary, setStatsSummary] =
    useState<UserFlashcardStatsSummaryResponse | null>(null);
  const [singleFlashcardStats, setSingleFlashcardStats] =
    useState<UserFlashcardStatResponse | null>(null);

  // Track the current flashcard ID for auto-refreshing stats
  const currentFlashcardIdRef = useRef<string | null>(null);

  // Loading and error states - keep these even if unused to maintain hook order
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch the summary statistics for the current user
   */
  const getUserFlashcardStats = useCallback(async () => {
    if (!userId) {
      setError("User ID is required");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await UserFlashcardStatsService.getUserFlashcardStatsSummary(
        userId
      );
      setStatsSummary(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch user flashcard stats";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Fetch statistics for a specific flashcard
   */
  const getSingleFlashcardStats = useCallback(
    async (flashcardId: string) => {
      if (!userId) {
        setError("User ID is required");
        return null;
      }

      // Don't fetch if flashcard ID is the same and we already have stats
      if (
        currentFlashcardIdRef.current === flashcardId &&
        singleFlashcardStats?.flashcardId === flashcardId
      ) {
        return singleFlashcardStats;
      }

      // Update the current flashcard ID reference
      currentFlashcardIdRef.current = flashcardId;

      setIsLoading(true);
      setError(null);

      try {
        const data = await UserFlashcardStatsService.getFlashcardStats(
          userId,
          flashcardId
        );
        setSingleFlashcardStats(data);
        return data;
      } catch (err) {
        // Only set error if this is still the current flashcard
        if (currentFlashcardIdRef.current === flashcardId) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to fetch flashcard stats";
          setError(errorMessage);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId] // Keep this dependency array minimal
  );

  /**
   * Submit an answer for a flashcard and update statistics
   */
  const submitFlashcardAnswer = useCallback(
    async (request: SubmitFlashcardAnswerRequest) => {
      if (!userId) {
        setError("User ID is required");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Add the userId if not already present
        const requestWithUserId = {
          ...request,
          userId: request.userId || userId,
        };

        // Submit the answer
        const data = await UserFlashcardStatsService.submitFlashcardAnswer(
          requestWithUserId
        );

        // If the submitted flashcard is the current one, update its stats directly
        // This avoids an additional API call
        if (currentFlashcardIdRef.current === request.flashcardId) {
          setSingleFlashcardStats(data);
        }

        // Update the summary stats - but only if needed
        // Skip this call if the options don't require it, to reduce API calls
        if (options.autoRefreshDetails) {
          await getUserFlashcardStats();
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to submit flashcard answer";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, getUserFlashcardStats, options.autoRefreshDetails]
  );

  /**
   * Reset the current flashcard stats
   */
  const resetCurrentFlashcardStats = useCallback(() => {
    setSingleFlashcardStats(null);
    currentFlashcardIdRef.current = null;
  }, []);

  return {
    // Data
    statsSummary,
    singleFlashcardStats,

    // State
    isLoading,
    error,

    // Actions
    getUserFlashcardStats,
    getSingleFlashcardStats,
    submitFlashcardAnswer,
    resetCurrentFlashcardStats,
  };
};
