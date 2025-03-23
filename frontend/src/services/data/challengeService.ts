import { apiClient } from "@services/api/apiClient";
import { ChallengeQuestion } from "@src/types";
import { storeData, retrieveData } from "@src/utils/storageUtils";

// Storage key constants
const STORAGE_KEYS = {
  DAILY_CHALLENGE_COMPLETION: "daily_challenge_completion",
  CACHED_CHALLENGE_QUESTIONS: "cached_challenge_questions",
};

/**
 * Service for managing daily challenges
 */
class ChallengeService {
  /**
   * Fetch daily challenge questions with smart retry logic
   * Uses cached questions if available and from today
   */
  async getDailyChallenge(
    retryCount = 0,
    maxRetries = 3
  ): Promise<ChallengeQuestion[]> {
    try {
      // Try to use cached questions from today
      const cachedQuestions = await this.getCachedQuestions();
      if (cachedQuestions) {
        return cachedQuestions;
      }

      // Fetch from API if no valid cache
      const questions = await apiClient.getDailyChallenge();

      // Cache valid responses
      if (questions?.length > 0) {
        await this.cacheQuestions(questions);
        return questions;
      }

      // Handle empty array with retries
      if (retryCount < maxRetries) {
        const waitTime = Math.min(2000 * Math.pow(1.5, retryCount), 10000);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.getDailyChallenge(retryCount + 1, maxRetries);
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
        return this.getDailyChallenge(retryCount + 1, maxRetries);
      }

      // No fallback to old cached questions - just throw the error
      throw error;
    }
  }

  /**
   * Check if user completed today's challenge
   */
  async hasDailyChallengeCompleted(userId: string): Promise<boolean> {
    if (!userId) return false;

    try {
      const completionData = await retrieveData<Record<string, string>>(
        STORAGE_KEYS.DAILY_CHALLENGE_COMPLETION
      );

      if (!completionData) return false;

      return completionData[userId] === this.getTodayDateString();
    } catch (error) {
      console.error("Error checking challenge status:", error);
      return false;
    }
  }

  /**
   * Mark challenge as completed for user
   */
  async setDailyChallengeCompleted(userId: string): Promise<void> {
    if (!userId) return;

    try {
      const completionData =
        (await retrieveData<Record<string, string>>(
          STORAGE_KEYS.DAILY_CHALLENGE_COMPLETION
        )) || {};

      completionData[userId] = this.getTodayDateString();
      await storeData(STORAGE_KEYS.DAILY_CHALLENGE_COMPLETION, completionData);
    } catch (error) {
      console.error("Error saving completion status:", error);
      throw new Error("Failed to save completion status");
    }
  }

  /**
   * Reset challenge completion status (dev only)
   */
  async resetDailyChallengeStatus(userId: string): Promise<void> {
    if (!userId) return;

    try {
      const completionData = await retrieveData<Record<string, string>>(
        STORAGE_KEYS.DAILY_CHALLENGE_COMPLETION
      );

      if (completionData && completionData[userId]) {
        delete completionData[userId];
        await storeData(
          STORAGE_KEYS.DAILY_CHALLENGE_COMPLETION,
          completionData
        );
      }
    } catch (error) {
      console.error("Error resetting challenge:", error);
    }
  }

  /**
   * Cache today's questions
   */
  private async cacheQuestions(questions: ChallengeQuestion[]): Promise<void> {
    const cacheData = {
      questions,
      timestamp: new Date().toISOString(),
    };

    await storeData(STORAGE_KEYS.CACHED_CHALLENGE_QUESTIONS, cacheData);
  }

  /**
   * Get cached questions if from today
   */
  private async getCachedQuestions(): Promise<ChallengeQuestion[] | null> {
    try {
      const cachedData = await retrieveData<{
        questions: ChallengeQuestion[];
        timestamp: string;
      }>(STORAGE_KEYS.CACHED_CHALLENGE_QUESTIONS);

      if (!cachedData?.questions?.length) return null;

      // Only use if from today
      const cachedDate = new Date(cachedData.timestamp)
        .toISOString()
        .split("T")[0];
      const today = this.getTodayDateString();

      return cachedDate === today ? cachedData.questions : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get today's date string
   */
  private getTodayDateString(): string {
    return new Date().toISOString().split("T")[0];
  }
}

export default new ChallengeService();
