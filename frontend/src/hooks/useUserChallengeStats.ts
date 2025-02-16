import { useState, useCallback } from "react";
import {
  UserChallengeStats,
  UpdateUserChallengeStatsRequest,
} from "@src/types";
import { UserChallengeStatsService } from "@src/services/data/userChallengeStatsService";
import useUIStore from "@stores/useUIStore";

export const useUserChallengeStats = (userId?: string) => {
  const [stats, setStats] = useState<UserChallengeStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setLoading } = useUIStore();
  const isLoading = useUIStore((state) => state.isLoading);

  // Fetch stats only once when the hook is initialized
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

  // Update stats with optimistic updates
  const updateStats = useCallback(
    async (updates: Partial<UpdateUserChallengeStatsRequest>) => {
      if (!userId || !stats) return;

      // Optimistic update
      const updatedStats = {
        ...stats,
        ...updates,
      };
      setStats(updatedStats);

      try {
        // Create complete request object by merging with existing stats
        const completeUpdates: UpdateUserChallengeStatsRequest = {
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          todayCorrectAnswers: stats.todayCorrectAnswers,
          todayIncorrectAnswers: stats.todayIncorrectAnswers,
          totalChallengesCompleted: stats.totalChallengesCompleted,
          totalCorrectAnswers: stats.totalCorrectAnswers,
          totalIncorrectAnswers: stats.totalIncorrectAnswers,
          ...updates,
        };

        await UserChallengeStatsService.updateUserChallengeStats(
          userId,
          completeUpdates
        );
      } catch (error) {
        // Revert on error
        setStats(stats);
        console.error("Error updating challenge stats:", error);
        throw error;
      }
    },
    [userId, stats]
  );

  // Other methods remain the same
  const updateDailyStreak = useCallback(async () => {
    if (!userId) return;
    try {
      await UserChallengeStatsService.updateDailyStreak(userId);
      await fetchStats(); // Refresh stats after streak update
    } catch (error) {
      console.error("Error updating daily streak:", error);
      throw error;
    }
  }, [userId, fetchStats]);

  const incrementQuizzesCompleted = useCallback(async () => {
    if (!userId) return;
    try {
      await UserChallengeStatsService.incrementQuizzesCompleted(userId);
      await fetchStats(); // Refresh stats after increment
    } catch (error) {
      console.error("Error incrementing quizzes completed:", error);
      throw error;
    }
  }, [userId, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    updateStats,
    updateDailyStreak,
    incrementQuizzesCompleted,
  };
};
