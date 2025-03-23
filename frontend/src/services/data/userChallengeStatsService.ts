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
      console.error(
        `[UserChallengeStatsService] updateUserChallengeStats: Error updating stats:`,
        error
      );
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
      const stats = await apiClient.createUserChallengeStats(request);

      return stats;
    } catch (error) {
      console.error(
        `[UserChallengeStatsService] createUserChallengeStats: Error creating stats:`,
        error
      );
      throw error;
    }
  }

  /**
   * Ensures challenge statistics exist for a user, creating them if needed
   * @param userId The ID of the user
   * @returns Promise<UserChallengeStats> The existing or newly created stats
   */
  static async ensureUserChallengeStatsExist(
    userId: string
  ): Promise<UserChallengeStats> {
    try {
      // First try to get existing stats
      try {
        const stats = await this.getUserChallengeStats(userId);

        return stats;
      } catch (error) {
        // If stats don't exist (404), create new ones
        if (error instanceof Error && error.message.includes("404")) {
          const newStatsRequest: CreateUserChallengeStatsRequest = {
            userId,
            currentStreak: 0,
            longestStreak: 0,
            todayCorrectAnswers: 0,
            todayIncorrectAnswers: 0,
            totalChallengesCompleted: 0,
            totalCorrectAnswers: 0,
            totalIncorrectAnswers: 0,
          };

          return await this.createUserChallengeStats(newStatsRequest);
        } else {
          // For other errors, just rethrow
          throw error;
        }
      }
    } catch (error) {
      console.error(
        `[UserChallengeStatsService] ensureUserChallengeStatsExist: Error ensuring stats exist:`,
        error
      );
      throw error;
    }
  }

  /**
   * Updates challenge statistics for a user, creating stats if they don't exist
   * @param userId The ID of the user
   * @param request The updated challenge stats
   */
  static async updateUserChallengeStatsCreateIfNeeded(
    userId: string,
    request: UpdateUserChallengeStatsRequest
  ): Promise<void> {
    try {
      // First ensure stats exist
      await this.ensureUserChallengeStatsExist(userId);

      // Then update the stats
      await this.updateUserChallengeStats(userId, request);
    } catch (error) {
      console.error(
        `[UserChallengeStatsService] updateUserChallengeStatsCreateIfNeeded: Error:`,
        error
      );
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
}
