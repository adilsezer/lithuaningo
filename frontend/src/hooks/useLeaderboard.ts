import { useCallback, useEffect, useState } from "react";
import { useUserData } from "@stores/useUserStore";
import { LeaderboardWeek, LeaderboardEntry } from "@src/types";
import leaderboardService from "@services/data/leaderboardService";
import { useSetError } from "@stores/useUIStore";

export const useLeaderboard = () => {
  const userData = useUserData();
  const setError = useSetError();
  const [leaderboard, setLeaderboard] = useState<LeaderboardWeek | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    if (!userData?.id) return;

    try {
      setIsLoading(true);
      const newLeaderboard =
        await leaderboardService.getCurrentWeekLeaderboard();
      setLeaderboard(newLeaderboard);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch leaderboard"
      );
    } finally {
      setIsLoading(false);
    }
  }, [userData?.id, setError]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const updateScore = useCallback(
    async (score: number) => {
      if (!userData?.id) return false;

      try {
        setIsLoading(true);
        await leaderboardService.updateLeaderboardEntry({
          userId: userData.id,
          score,
        });
        await fetchLeaderboard();
        return true;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to update score"
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [userData?.id, fetchLeaderboard, setError]
  );

  // Convert entries object to array and sort by score
  const sortedEntries = Object.values(leaderboard?.entries ?? {}).sort(
    (a, b) => b.score - a.score
  );

  return {
    entries: sortedEntries,
    isLoading,
    updateScore,
    startDate: leaderboard?.startDate,
    endDate: leaderboard?.endDate,
  };
};
