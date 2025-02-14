import apiClient from "@services/api/apiClient";
import {
  UserFlashcardStats,
  TrackProgressRequest,
  UserFlashcardStatsResponse,
} from "@src/types";

export class UserFlashcardStatsService {
  /**
   * Gets flashcard statistics for a specific deck and user
   * @param deckId The deck ID
   * @param userId The user ID
   * @returns Promise<UserFlashcardStatsResponse>
   */
  static async getUserFlashcardStats(
    deckId: string,
    userId: string
  ): Promise<UserFlashcardStatsResponse> {
    try {
      return await apiClient.getUserFlashcardStats(deckId, userId);
    } catch (error) {
      console.error("Error in getUserFlashcardStats:", error);
      throw error;
    }
  }

  /**
   * Gets flashcard review history for a user
   * @param userId The user ID
   * @returns Promise<UserFlashcardStatsResponse[]>
   */
  static async getUserFlashcardHistory(
    userId: string
  ): Promise<UserFlashcardStatsResponse[]> {
    try {
      return await apiClient.getUserFlashcardHistory(userId);
    } catch (error) {
      console.error("Error in getUserFlashcardHistory:", error);
      throw error;
    }
  }

  /**
   * Tracks progress for a flashcard review
   * @param deckId The deck ID
   * @param request The progress tracking request
   */
  static async trackProgress(
    deckId: string,
    request: TrackProgressRequest
  ): Promise<void> {
    try {
      await apiClient.trackProgress(deckId, request);
    } catch (error) {
      console.error("Error in trackProgress:", error);
      throw error;
    }
  }
}
