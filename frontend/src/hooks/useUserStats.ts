import { useState, useEffect } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { UserStats } from "@src/types";
import { userStatsService } from "@services/data/userStatsService";

export const useUserStats = () => {
  const { id: userId } = useAppSelector(selectUserData) ?? {};
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const userStats = await userStatsService.fetchUserStats(userId);
      setStats(userStats);
    } catch (err) {
      setError("Failed to fetch user stats");
      console.error("Error fetching user stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementQuizzesCompleted = async () => {
    if (!userId) return;

    try {
      await userStatsService.incrementQuizzesCompleted(userId);
      await fetchStats(); // Refresh stats after update
    } catch (err) {
      console.error("Error incrementing quizzes completed:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  return {
    stats,
    error,
    isLoading,
    fetchStats,
    incrementQuizzesCompleted,
  };
};
