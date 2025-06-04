import { apiClient } from "@services/api/apiClient";
import {
  UserChallengeStatsResponse,
  SubmitChallengeAnswerRequest,
} from "@src/types";

export class UserChallengeStatsService {
  /**
   * Fetches challenge statistics for a user
   * If stats don't exist, the backend will create them automatically
   * @param userId The ID of the user
   * @returns Promise<UserChallengeStatsResponse>
   */
  static async getUserChallengeStats(
    userId: string,
  ): Promise<UserChallengeStatsResponse> {
    try {
      const response = await apiClient.getUserChallengeStats(userId);
      console.log(
        "[UserChallengeStatsService] HasCompletedTodayChallenge:",
        response.hasCompletedTodayChallenge,
      );
      return response;
    } catch (error) {
      console.error("[UserChallengeStatsService] Error:", error);
      throw error;
    }
  }

  static async submitChallengeAnswer(
    request: SubmitChallengeAnswerRequest,
  ): Promise<UserChallengeStatsResponse> {
    try {
      return await apiClient.submitChallengeAnswer(request);
    } catch (error) {
      console.error(
        "[UserChallengeStatsService] Error submitting challenge answer:",
        error,
      );
      throw error;
    }
  }
}
