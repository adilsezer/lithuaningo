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
  async getDailyChallengeQuestions(
    retryCount = 0,
    maxRetries = 3
  ): Promise<ChallengeQuestionResponse[]> {
    try {
      const questions = await apiClient.getDailyChallengeQuestions();

      if (questions?.length > 0) {
        return questions;
      }

      if (retryCount < maxRetries) {
        const waitTime = Math.min(2000 * Math.pow(1.5, retryCount), 10000);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.getDailyChallengeQuestions(retryCount + 1, maxRetries);
      }

      throw new Error("No questions available. Please try again later.");
    } catch (error: any) {
      // Retry server errors (5xx)
      if (
        (error.status === 500 || error.status === 503) &&
        retryCount < maxRetries
      ) {
        const waitTime = Math.min(2000 * Math.pow(1.5, retryCount), 10000);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.getDailyChallengeQuestions(retryCount + 1, maxRetries);
      }
      throw error;
    }
  }
}

export default new ChallengeService();
