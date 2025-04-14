import { apiClient } from "@services/api/apiClient";
import {
  SubmitFlashcardAnswerRequest,
  UserFlashcardStatResponse,
  UserFlashcardStatsSummaryResponse,
} from "@src/types/UserFlashcardStats";

export class UserFlashcardStatsService {
  /**
   * Fetches flashcard statistics summary for a user
   * @param userId The ID of the user
   * @returns Promise<UserFlashcardStatsSummaryResponse>
   */
  static async getUserFlashcardStatsSummary(
    userId: string
  ): Promise<UserFlashcardStatsSummaryResponse> {
    try {
      return await apiClient.getUserFlashcardStatsSummary(userId);
    } catch (error) {
      console.error("[UserFlashcardStatsService] Error:", error);
      throw error;
    }
  }

  /**
   * Submits a flashcard answer and updates user stats
   * @param request The flashcard answer submission request
   * @returns Promise<UserFlashcardStatResponse>
   */
  static async submitFlashcardAnswer(
    request: SubmitFlashcardAnswerRequest
  ): Promise<UserFlashcardStatResponse> {
    try {
      return await apiClient.submitFlashcardAnswer(request);
    } catch (error) {
      console.error(
        "[UserFlashcardStatsService] Error submitting flashcard answer:",
        error
      );
      throw error;
    }
  }
}
