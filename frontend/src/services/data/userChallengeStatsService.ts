import apiClient from "@services/api/apiClient";
import {
  UserChallengeStats,
  CreateUserChallengeStatsRequest,
  UpdateUserChallengeStatsRequest,
} from "@src/types";

export class UserChallengeStatsService {
  /**
   * Fetches challenge statistics for a user
   * @param userId The ID of the user
   * @returns Promise<UserChallengeStats>
   */
  static async getUserChallengeStats(
    userId: string
  ): Promise<UserChallengeStats> {
    try {
      return await apiClient.getUserChallengeStats(userId);
    } catch (error) {
      console.error("Error in getUserChallengeStats:", error);
      throw error;
    }
  }

  /**
   * Updates challenge statistics for a user
   * @param userId The ID of the user
   * @param request The updated challenge stats
   */
  static async updateUserChallengeStats(
    userId: string,
    request: UpdateUserChallengeStatsRequest
  ): Promise<UserChallengeStats> {
    try {
      return await apiClient.updateUserChallengeStats(userId, request);
    } catch (error) {
      console.error("Error in updateUserChallengeStats:", error);
      throw error;
    }
  }

  /**
   * Updates the daily streak for a user
   * @param userId The ID of the user
   */
  static async updateDailyStreak(userId: string): Promise<void> {
    try {
      await apiClient.updateDailyStreak(userId);
    } catch (error) {
      console.error("Error in updateDailyStreak:", error);
      throw error;
    }
  }

  /**
   * Increments the total number of quizzes completed by a user
   * @param userId The ID of the user
   */
  static async incrementQuizzesCompleted(userId: string): Promise<void> {
    try {
      await apiClient.incrementQuizzesCompleted(userId);
    } catch (error) {
      console.error("Error in incrementQuizzesCompleted:", error);
      throw error;
    }
  }
}
