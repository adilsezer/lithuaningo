import { useState, useCallback } from "react";
import leaderboardService from "@services/data/leaderboardService";
import { LeaderboardEntry } from "@src/types";

export const useLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newEntries = await leaderboardService.getCurrentWeekLeaderboard();
      setEntries(newEntries);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch leaderboard")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEntry = useCallback(
    async (userId: string, score: number) => {
      try {
        await leaderboardService.updateLeaderboardEntry({ userId, score });
        await fetchLeaderboard(); // Refresh the leaderboard after update
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update leaderboard")
        );
      }
    },
    [fetchLeaderboard]
  );

  return {
    entries,
    loading,
    error,
    fetchLeaderboard,
    updateEntry,
  };
};
