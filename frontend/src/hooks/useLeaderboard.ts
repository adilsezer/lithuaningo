import { useState, useCallback } from "react";
import { useSetLoading, useSetError } from "@src/stores/useUIStore";
import leaderboardService from "@services/data/leaderboardService";
import { LeaderboardEntryResponse } from "@src/types";

export const useLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntryResponse[]>([]);

  // Global UI state handlers
  const setLoading = useSetLoading();
  const setError = useSetError();

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newEntries = await leaderboardService.getCurrentWeekLeaderboard();
      setEntries(newEntries);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch leaderboard",
      );
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const updateEntry = useCallback(
    async (userId: string, score: number) => {
      setLoading(true);
      try {
        await leaderboardService.updateLeaderboardEntry({
          userId,
          scoreToAdd: score,
        });
        await fetchLeaderboard(); // Refresh the leaderboard after update
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update leaderboard",
        );
        setLoading(false);
      }
    },
    [fetchLeaderboard, setLoading, setError],
  );

  return {
    entries,
    fetchLeaderboard,
    updateEntry,
  };
};
