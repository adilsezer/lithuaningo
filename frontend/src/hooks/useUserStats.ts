import { useState, useCallback, useEffect } from "react";
import { useUserData } from "@stores/useUserStore";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";
import { UserStats } from "@src/types";
import { userStatsService } from "@services/data/userStatsService";

export const useUserStats = () => {
  const userData = useUserData();
  const userId = userData?.id;
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const error = useError();
  const [stats, setStats] = useState<UserStats | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const userStats = await userStatsService.fetchUserStats(userId);
      setStats(userStats);
    } catch (err) {
      setError("Failed to fetch user stats");
      console.error("Error fetching user stats:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, setLoading, setError]);

  const incrementQuizzesCompleted = useCallback(async () => {
    if (!userId) return;

    try {
      await userStatsService.incrementQuizzesCompleted(userId);
      await fetchStats(); // Refresh stats after update
    } catch (err) {
      setError("Failed to increment quizzes");
      console.error("Error incrementing quizzes completed:", err);
    }
  }, [userId, fetchStats, setError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    error,
    isLoading,
    fetchStats,
    incrementQuizzesCompleted,
  };
};
