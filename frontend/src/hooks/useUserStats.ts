import { useState, useEffect } from "react";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { UserStats } from "@src/types";
import userStatsService from "@services/data/userStatsService";

export const useUserStats = () => {
  const { id: userId } = useAppSelector(selectUserData) ?? {};
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      const stats = await userStatsService.fetchUserStats(userId);
      setStats(stats);
    };

    fetchStats();
  }, [userId]);

  const updateAnswerStats = async (isCorrect: boolean) => {
    if (!userId || __DEV__) return;

    try {
      await userStatsService.updateAnswerStats(userId, isCorrect);
    } catch (error) {
      console.error("Error updating answer stats:", error);
    }
  };

  const incrementQuizzesCompleted = async () => {
    if (!userId || __DEV__) return;

    try {
      await userStatsService.incrementQuizzesCompleted(userId);
    } catch (error) {
      console.error("Error incrementing quizzes completed:", error);
    }
  };

  return {
    stats,
    updateAnswerStats,
    incrementQuizzesCompleted,
  };
};
