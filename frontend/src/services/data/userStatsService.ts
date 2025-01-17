import apiClient from "@services/api/apiClient";
import { UserStats } from "@src/types";

const fetchUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    return await apiClient.getUserStats(userId);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
};

const incrementQuizzesCompleted = async (userId: string): Promise<void> => {
  try {
    const userStats = await apiClient.getUserStats(userId);
    if (userStats) {
      userStats.totalQuizzesCompleted++;
      await apiClient.updateUserStats(userStats);
    }
  } catch (error) {
    console.error("Error updating quizzes completed:", error);
    throw error;
  }
};

export const userStatsService = {
  fetchUserStats,
  incrementQuizzesCompleted,
};
