import { apiClient } from "@services/api/apiClient";
import { UserChallengeStatsResponse } from "@src/types";

export class UserChallengeStatsService {
  /**
   * Fetches challenge statistics for a user
   * If stats don't exist, the backend will create them automatically
   * @param userId The ID of the user
   * @returns Promise<UserChallengeStatsResponse>
   */
  static async getUserChallengeStats(
    userId: string
  ): Promise<UserChallengeStatsResponse> {
    try {
      const stats = await apiClient.getUserChallengeStats(userId);
      return stats;
    } catch (error) {
      console.error(
        `[UserChallengeStatsService] getUserChallengeStats: Error fetching stats:`,
        error
      );
      throw error;
    }
  }
}
