import { apiClient } from "@services/api/apiClient";
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
  ): Promise<void> {
    try {
      await apiClient.updateUserChallengeStats(userId, request);
    } catch (error) {
      console.error("Error in updateUserChallengeStats:", error);
      throw error;
    }
  }

  /**
   * Creates challenge statistics for a user
   * @param request The challenge stats to create
   * @returns Promise<UserChallengeStats>
   */
  static async createUserChallengeStats(
    request: CreateUserChallengeStatsRequest
  ): Promise<UserChallengeStats> {
    try {
      return await apiClient.createUserChallengeStats(request);
    } catch (error) {
      console.error("Error in createUserChallengeStats:", error);
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
   * Increments the total number of challenges completed by a user
   * @param userId The ID of the user
   */
  static async incrementChallengesCompleted(userId: string): Promise<void> {
    try {
      await apiClient.incrementChallengesCompleted(userId);
    } catch (error) {
      console.error("Error in incrementChallengesCompleted:", error);
      throw error;
    }
  }
}
