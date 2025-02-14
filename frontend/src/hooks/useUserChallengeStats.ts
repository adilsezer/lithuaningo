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

  const updateDailyStreak = useCallback(async () => {
    if (!userId) return;
    try {
      await UserChallengeStatsService.updateDailyStreak(userId);
      await fetchStats(); // Refresh stats after update
    } catch (error) {
      console.error("Error updating daily streak:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update streak"
      );
    }
  }, [userId, fetchStats]);

  const incrementQuizzesCompleted = useCallback(async () => {
    if (!userId) return;
    try {
      await UserChallengeStatsService.incrementQuizzesCompleted(userId);
      await fetchStats(); // Refresh stats after increment
    } catch (error) {
      console.error("Error incrementing quizzes completed:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update stats"
      );
    }
  }, [userId, fetchStats]);

  const updateStats = useCallback(
    async (updates: Partial<UserChallengeStats>) => {
      if (!userId || !stats) return;
      try {
        const updatedStats =
          await UserChallengeStatsService.updateUserChallengeStats(userId, {
            currentStreak: updates.currentStreak ?? stats.currentStreak,
            longestStreak: updates.longestStreak ?? stats.longestStreak,
            todayCorrectAnswers:
              updates.todayCorrectAnswers ?? stats.todayCorrectAnswers,
            todayIncorrectAnswers:
              updates.todayIncorrectAnswers ?? stats.todayIncorrectAnswers,
            totalChallengesCompleted:
              updates.totalChallengesCompleted ??
              stats.totalChallengesCompleted,
            totalCorrectAnswers:
              updates.totalCorrectAnswers ?? stats.totalCorrectAnswers,
            totalIncorrectAnswers:
              updates.totalIncorrectAnswers ?? stats.totalIncorrectAnswers,
          });
        setStats(updatedStats);
      } catch (error) {
        console.error("Error updating stats:", error);
        setError(
          error instanceof Error ? error.message : "Failed to update stats"
        );
      }
    },
    [userId, stats]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    error,
    isLoading,
    updateDailyStreak,
    incrementQuizzesCompleted,
    updateStats,
    refreshStats: fetchStats,
  };
};
