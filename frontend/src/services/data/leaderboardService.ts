import { apiClient, ApiError } from "@services/api/apiClient";
import {
  LeaderboardEntryResponse,
  UpdateLeaderboardEntryRequest,
} from "@src/types";

class LeaderboardService {
  async getCurrentWeekLeaderboard(): Promise<LeaderboardEntryResponse[]> {
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

  async updateLeaderboardEntry(
    request: UpdateLeaderboardEntryRequest,
  ): Promise<LeaderboardEntryResponse> {
    try {
      return await apiClient.updateLeaderboardEntry(request);
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
