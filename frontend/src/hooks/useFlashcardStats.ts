import { useState, useCallback } from "react";
import {
  UserFlashcardStatsSummaryResponse,
  SubmitFlashcardAnswerRequest,
} from "@src/types/UserFlashcardStats";
import { UserFlashcardStatsService } from "@services/data/userFlashcardStatsService";

export const useFlashcardStats = (userId?: string) => {
  const [stats, setStats] = useState<UserFlashcardStatsSummaryResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setStats(data);
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

  const submitFlashcardAnswer = useCallback(
    async (request: SubmitFlashcardAnswerRequest) => {
      if (!userId) {
        setError("User ID is required");
        return null;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await UserFlashcardStatsService.submitFlashcardAnswer({
          ...request,
          userId,
        });
        // After submitting an answer, refresh the stats summary
        await getUserFlashcardStats();
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
    [userId, getUserFlashcardStats]
  );

  return {
    stats,
    isLoading,
    error,
    getUserFlashcardStats,
    submitFlashcardAnswer,
  };
};
