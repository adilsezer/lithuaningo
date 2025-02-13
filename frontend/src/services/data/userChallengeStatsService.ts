import apiClient from "@services/api/apiClient";
import { UserChallengeStats } from "@src/types";

export class UserChallengeStatsService {
  /**
   * Fetches challenge statistics for a user
   * @param userId The ID of the user
   * @returns Promise<ChallengeStats>
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
   * Increments the number of cards reviewed for a user
   * @param userId The ID of the user
   */
  static async incrementCardsReviewed(userId: string): Promise<void> {
    try {
      await apiClient.incrementCardsReviewed(userId);
    } catch (error) {
      console.error("Error in incrementCardsReviewed:", error);
      throw error;
    }
  }

  /**
   * Increments the number of cards mastered for a user
   * @param userId The ID of the user
   */
  static async incrementCardsMastered(userId: string): Promise<void> {
    try {
      await apiClient.incrementCardsMastered(userId);
    } catch (error) {
      console.error("Error in incrementCardsMastered:", error);
      throw error;
    }
  }

  /**
   * Updates the weekly goal for a user
   * @param userId The ID of the user
   * @param goal The new weekly goal
   */
  static async updateWeeklyGoal(userId: string, goal: number): Promise<void> {
    try {
      await apiClient.updateWeeklyGoal(userId, goal);
    } catch (error) {
      console.error("Error in updateWeeklyGoal:", error);
      throw error;
    }
  }

  /**
   * Updates challenge statistics for a user
   * @param userId The ID of the user
   * @param stats Partial challenge stats to update
   */
  static async updateUserChallengeStats(
    userId: string,
    stats: Partial<UserChallengeStats>
  ): Promise<UserChallengeStats> {
    try {
      return await apiClient.updateUserChallengeStats(userId, stats);
    } catch (error) {
      console.error("Error in updateUserChallengeStats:", error);
      throw error;
    }
  }
}
