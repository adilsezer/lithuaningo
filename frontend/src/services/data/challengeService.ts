import { apiClient } from "../api/apiClient";
import { ChallengeQuestion, ChallengeResult } from "@src/types";

class ChallengeService {
  // More patient retry logic with up to 10 retries (can handle longer AI generation)
  async getDailyChannel(
    retryCount = 0,
    maxRetries = 10
  ): Promise<ChallengeQuestion[]> {
    try {
      const questions = await apiClient.getDailyChallenge();

      // Return immediately if we have questions
      if (questions && questions.length > 0) {
        console.log(
          `Successfully fetched ${questions.length} challenge questions`
        );
        return questions;
      } else {
        // Empty array - log and continue to retry
        console.warn("Server returned empty questions array");
        if (retryCount < maxRetries) {
          // More patient backoff for empty arrays - could be generating questions
          const waitTime = Math.min(3000 * Math.pow(1.5, retryCount), 30000);
          console.log(
            `No questions found. Retrying (${
              retryCount + 1
            }/${maxRetries}) after ${waitTime / 1000}s...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          return this.getDailyChannel(retryCount + 1, maxRetries);
        } else {
          throw new Error("No quiz questions available after multiple retries");
        }
      }
    } catch (error: any) {
      console.error("Error fetching daily quiz:", error);

      const errorMessage = error?.data || error?.message || "Unknown error";
      console.log(`Error details: ${errorMessage}`);

      // If the server returned a 500/503 error and we haven't reached max retries,
      // it likely means the AI is still generating questions
      if (
        (error.status === 500 || error.status === 503) &&
        retryCount < maxRetries
      ) {
        // Exponential backoff - wait longer between each retry
        // Base wait: 3 seconds, then exponential growth capped at 30s
        const waitTime = Math.min(3000 * Math.pow(1.5, retryCount), 30000);

        console.log(
          `AI likely generating questions. Retrying (${
            retryCount + 1
          }/${maxRetries}) after ${waitTime / 1000}s...`
        );

        // Wait with exponential backoff before retrying
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.getDailyChannel(retryCount + 1, maxRetries);
      }

      // Re-throw the error so the component can handle it
      throw error;
    }
  }

  // Generate new quiz questions using AI
  async generateNewChallenge(
    retryCount = 0,
    maxRetries = 3
  ): Promise<ChallengeQuestion[]> {
    try {
      console.log("Requesting AI to generate new quiz questions");
      const questions = await apiClient.generateAIChallenge();
      return questions;
    } catch (error: any) {
      console.error("Error generating new quiz:", error);

      // If we haven't reached max retries, try again with exponential backoff
      if (retryCount < maxRetries) {
        const waitTime = Math.min(3000 * Math.pow(2, retryCount), 30000);
        console.log(`Retrying AI quiz generation in ${waitTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.generateNewChallenge(retryCount + 1, maxRetries);
      }

      throw error;
    }
  }

  async submitChallengeResult(
    result: Omit<ChallengeResult, "completedAt">
  ): Promise<void> {
    return apiClient.submitChallengeResult(result);
  }

  async getQuizHistory(userId: string): Promise<ChallengeResult[]> {
    return apiClient.getChallengeHistory(userId);
  }
}

export default new ChallengeService();
