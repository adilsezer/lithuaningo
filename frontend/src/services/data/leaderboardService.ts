import apiClient, { ApiError } from "@services/api/apiClient";
import { LeaderboardWeek } from "@src/types";

const getCurrentWeekLeaderboard = async (): Promise<LeaderboardWeek | null> => {
  try {
    return await apiClient.getCurrentWeekLeaderboard();
  } catch (error) {
    if (error instanceof ApiError) {
      //crashlytics().recordError(error);
      console.error(`API Error ${error.status}:`, error.data);
    } else {
      console.error("Error fetching current week leaderboard:", error);
    }
    return null;
  }
};

const getWeekLeaderboard = async (
  weekId: string
): Promise<LeaderboardWeek | null> => {
  try {
    if (!weekId) {
      console.error("Week ID is required");
      return null;
    }
    return await apiClient.getWeekLeaderboard(weekId);
  } catch (error) {
    if (error instanceof ApiError) {
      //crashlytics().recordError(error);
      console.error(`API Error ${error.status}:`, error.data);
    } else {
      console.error("Error fetching week leaderboard:", error);
    }
    return null;
  }
};

const updateLeaderboardEntry = async (
  userId: string,
  name: string,
  score: number
): Promise<boolean> => {
  try {
    await apiClient.updateLeaderboardScore(userId, name, score);
    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      //crashlytics().recordError(error);
      console.error(`API Error ${error.status}:`, error.data);
    } else {
      console.error("Error updating leaderboard entry:", error);
    }
    return false;
  }
};

export default {
  getCurrentWeekLeaderboard,
  getWeekLeaderboard,
  updateLeaderboardEntry,
};
