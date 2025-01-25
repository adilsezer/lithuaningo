import apiClient from "@services/api/apiClient";
import { UserStats } from "@src/types";

const createDefaultStats = (userId: string): UserStats => ({
  userId,
  level: 1,
  experiencePoints: 0,
  dailyStreak: 0,
  lastStreakUpdate: new Date(),
  totalWordsLearned: 0,
  learnedWordIds: [],
  totalQuizzesCompleted: 0,
  todayAnsweredQuestions: 0,
  todayCorrectAnsweredQuestions: 0,
  lastActivityTime: new Date(),
});

const fetchUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const stats = await apiClient.getUserStats(userId);
    return stats;
  } catch (error: any) {
    if (error?.status === 404) {
      // If stats don't exist, create them
      const defaultStats = createDefaultStats(userId);
      await apiClient.createUserStats(defaultStats);
      return defaultStats;
    }
    console.error("Error fetching user stats:", error);
    throw error;
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
