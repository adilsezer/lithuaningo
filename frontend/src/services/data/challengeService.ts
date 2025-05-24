import { apiClient } from '@services/api/apiClient';
import {
  ChallengeQuestionResponse,
  GetReviewChallengeQuestionsRequest,
} from '@src/types';

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
        '[ChallengeService] Error fetching daily challenge questions:',
        error,
      );
      throw error;
    }
  }

  /**
   * Fetch review challenge questions.
   * These can be category-specific if categoryId is provided.
   * @param request Request object containing count, categoryId, and optional userId
   */
  async getReviewChallengeQuestions(
    request: GetReviewChallengeQuestionsRequest,
  ): Promise<ChallengeQuestionResponse[]> {
    try {
      return await apiClient.getReviewChallengeQuestions(request);
    } catch (error) {
      console.error(
        '[ChallengeService] Error fetching review challenge questions:',
        error,
      );
      throw error;
    }
  }
}

export default new ChallengeService();
