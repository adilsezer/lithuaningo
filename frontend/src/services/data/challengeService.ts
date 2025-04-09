import { apiClient } from "@services/api/apiClient";
import { ChallengeQuestionResponse } from "@src/types";

/**
 * Service for managing daily challenges
 */
class ChallengeService {
  /**
   * Fetch daily challenge questions with smart retry logic
   * Uses cached questions if available and from today
   */
  async getDailyChallengeQuestions(): Promise<ChallengeQuestionResponse[]> {
    try {
      return await apiClient.getDailyChallengeQuestions();
    } catch (error) {
      console.error(
        "[ChallengeService] Error fetching daily challenge questions:",
        error
      );
      throw error;
    }
  }
}

export default new ChallengeService();
