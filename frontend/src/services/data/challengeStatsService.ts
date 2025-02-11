import apiClient from "@services/api/apiClient";
import { ChallengeStats } from "@src/types";

export class ChallengeStatsService {
  /**
   * Fetches challenge statistics for a user
   * @param userId The ID of the user
   * @returns Promise<ChallengeStats>
   */
  static async getChallengeStats(userId: string): Promise<ChallengeStats> {
    try {
      return await apiClient.getChallengeStats(userId);
    } catch (error) {
      console.error("Error in getChallengeStats:", error);
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
  static async updateChallengeStats(
    userId: string,
    stats: Partial<ChallengeStats>
  ): Promise<ChallengeStats> {
    try {
      return await apiClient.updateChallengeStats(userId, stats);
    } catch (error) {
      console.error("Error in updateChallengeStats:", error);
      throw error;
    }
  }

  /**
   * Gets the flashcard history for a user
   * @param userId The ID of the user
   */
  static async getFlashcardHistory(userId: string): Promise<ChallengeStats[]> {
    try {
      return await apiClient.getFlashcardHistory(userId);
    } catch (error) {
      console.error("Error in getFlashcardHistory:", error);
      throw error;
    }
  }
}
