import { useState, useCallback } from "react";
import { UserFlashcardStatsResponse, TrackProgressRequest } from "@src/types";
import { UserFlashcardStatsService } from "@services/data/userFlashcardStatsService";
import { useAlertDialog } from "@hooks/useAlertDialog";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";

export const useFlashcardStats = () => {
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const error = useError();
  const { showError } = useAlertDialog();
  const [stats, setStats] = useState<UserFlashcardStatsResponse | null>(null);
  const [history, setHistory] = useState<UserFlashcardStatsResponse[]>([]);

  const handleError = useCallback(
    (error: Error, message: string) => {
      console.error(message, error);
      setError(message);
      showError(message);
      return null;
    },
    [setError, showError]
  );

  const getUserFlashcardStats = useCallback(
    async (deckId: string, userId: string) => {
      try {
        setLoading(true);
        setError(null);
        const data = await UserFlashcardStatsService.getUserFlashcardStats(
          deckId,
          userId
        );
        setStats(data);
        return data;
      } catch (error) {
        handleError(error as Error, "Failed to load flashcard stats");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [handleError, setError, setLoading]
  );

  const getUserFlashcardHistory = useCallback(
    async (userId: string) => {
      try {
        setLoading(true);
        setError(null);
        const data = await UserFlashcardStatsService.getUserFlashcardHistory(
          userId
        );
        setHistory(data);
        return data;
      } catch (error) {
        handleError(error as Error, "Failed to load flashcard history");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [handleError, setError, setLoading]
  );

  const trackProgress = useCallback(
    async (deckId: string, request: TrackProgressRequest) => {
      try {
        setLoading(true);
        setError(null);
        await UserFlashcardStatsService.trackProgress(deckId, request);
        // Refresh stats after tracking progress
        if (stats?.userId) {
          await getUserFlashcardStats(deckId, stats.userId);
        }
      } catch (error) {
        handleError(error as Error, "Failed to track progress");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [handleError, setError, setLoading, getUserFlashcardStats, stats]
  );

  return {
    stats,
    history,
    isLoading,
    error,
    getUserFlashcardStats,
    getUserFlashcardHistory,
    trackProgress,
  };
};
