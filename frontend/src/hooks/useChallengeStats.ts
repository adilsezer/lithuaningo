import { useState, useEffect, useCallback } from "react";
import { ChallengeStats } from "@src/types";
import useUIStore from "@stores/useUIStore";
import { ChallengeStatsService } from "@src/services/data/challengeStatsService";

export const useChallengeStats = (userId?: string) => {
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setLoading } = useUIStore();
  const isLoading = useUIStore((state) => state.isLoading);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await ChallengeStatsService.getChallengeStats(userId);
      setStats(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching challenge stats:", error);
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
      await ChallengeStatsService.incrementCardsReviewed(userId);
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
      await ChallengeStatsService.incrementCardsMastered(userId);
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
        await ChallengeStatsService.updateWeeklyGoal(userId, goal);
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
