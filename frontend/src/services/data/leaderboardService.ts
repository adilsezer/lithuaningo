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
        // Only log error status, not sensitive data
        if (__DEV__) {
          console.error(`API Error ${error.status}:`, {
            message: error.message,
            hasData: !!error.data,
          });
        } else {
          console.error(`API Error ${error.status}`);
        }
      } else {
        console.error(
          "Error fetching current week leaderboard:",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
      throw error;
    }
  }

  async updateLeaderboardEntry(
    request: UpdateLeaderboardEntryRequest
  ): Promise<LeaderboardEntryResponse> {
    try {
      return await apiClient.updateLeaderboardEntry(request);
    } catch (error) {
      if (error instanceof ApiError) {
        // Only log error status, not sensitive data
        if (__DEV__) {
          console.error(`API Error ${error.status}:`, {
            message: error.message,
            hasData: !!error.data,
          });
        } else {
          console.error(`API Error ${error.status}`);
        }
      } else {
        console.error(
          "Error updating leaderboard entry:",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
      throw error;
    }
  }
}

export default new LeaderboardService();
