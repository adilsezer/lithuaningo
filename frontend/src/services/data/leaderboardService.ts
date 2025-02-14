import apiClient, { ApiError } from "@services/api/apiClient";
import { LeaderboardWeek, UpdateLeaderboardEntryRequest } from "@src/types";

class LeaderboardService {
  async getCurrentWeekLeaderboard(): Promise<LeaderboardWeek | null> {
    try {
      return await apiClient.getCurrentWeekLeaderboard();
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`API Error ${error.status}:`, error.data);
      } else {
        console.error("Error fetching current week leaderboard:", error);
      }
      throw error;
    }
  }

  async getWeekLeaderboard(weekId: string): Promise<LeaderboardWeek | null> {
    try {
      if (!weekId) {
        throw new Error("Week ID is required");
      }
      return await apiClient.getWeekLeaderboard(weekId);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`API Error ${error.status}:`, error.data);
      } else {
        console.error("Error fetching week leaderboard:", error);
      }
      throw error;
    }
  }

  async updateLeaderboardEntry(
    request: UpdateLeaderboardEntryRequest
  ): Promise<boolean> {
    try {
      await apiClient.updateLeaderboardEntry(request);
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`API Error ${error.status}:`, error.data);
      } else {
        console.error("Error updating leaderboard entry:", error);
      }
      throw error;
    }
  }
}

export default new LeaderboardService();
