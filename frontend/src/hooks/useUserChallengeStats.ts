import { useState, useEffect, useCallback } from "react";
import { UserChallengeStats } from "@src/types";
import useUIStore from "@stores/useUIStore";
import { UserChallengeStatsService } from "@src/services/data/userChallengeStatsService";

export const useUserChallengeStats = (userId?: string) => {
  const [stats, setStats] = useState<UserChallengeStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setLoading } = useUIStore();
  const isLoading = useUIStore((state) => state.isLoading);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await UserChallengeStatsService.getUserChallengeStats(
        userId
      );
      setStats(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching user challenge stats:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch stats"
      );
    } finally {
      setLoading(false);
    }
  }, [userId, setLoading]);

  const incrementCardsReviewed = useCallback(async () => {
    if (!userId) return;
    try {
      await UserChallengeStatsService.incrementCardsReviewed(userId);
      await fetchStats(); // Refresh stats after increment
    } catch (error) {
      console.error("Error incrementing cards reviewed:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update stats"
      );
    }
  }, [userId, fetchStats]);

  const incrementCardsMastered = useCallback(async () => {
    if (!userId) return;
    try {
      await UserChallengeStatsService.incrementCardsMastered(userId);
      await fetchStats(); // Refresh stats after increment
    } catch (error) {
      console.error("Error incrementing cards mastered:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update stats"
      );
    }
  }, [userId, fetchStats]);

  const updateWeeklyGoal = useCallback(
    async (goal: number) => {
      if (!userId) return;
      try {
        await UserChallengeStatsService.updateWeeklyGoal(userId, goal);
        await fetchStats(); // Refresh stats after update
      } catch (error) {
        console.error("Error updating weekly goal:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to update weekly goal"
        );
      }
    },
    [userId, fetchStats]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    error,
    isLoading,
    incrementCardsReviewed,
    incrementCardsMastered,
    updateWeeklyGoal,
    refreshStats: fetchStats,
  };
};
