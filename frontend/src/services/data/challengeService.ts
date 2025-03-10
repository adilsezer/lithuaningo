import { apiClient } from "../api/apiClient";
import { ChallengeQuestion, ChallengeResult } from "@src/types";
import { storeData, retrieveData } from "@src/utils/storageUtils";

class ChallengeService {
  // Storage key for the daily challenge completion
  private DAILY_CHALLENGE_KEY = "daily_challenge_completion";

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

  // Generate deck-specific challenge questions
  async generateDeckChallenge(
    deckId: string,
    retryCount = 0,
    maxRetries = 3
  ): Promise<ChallengeQuestion[]> {
    try {
      console.log(`Generating challenge questions for deck: ${deckId}`);
      const questions = await apiClient.generateDeckChallenge(deckId);
      return questions;
    } catch (error: any) {
      console.error(
        `Error generating deck challenge for deck ${deckId}:`,
        error
      );

      // If we haven't reached max retries, try again with exponential backoff
      if (retryCount < maxRetries) {
        const waitTime = Math.min(3000 * Math.pow(2, retryCount), 30000);
        console.log(
          `Retrying deck challenge generation in ${waitTime / 1000}s...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.generateDeckChallenge(deckId, retryCount + 1, maxRetries);
      }

      throw error;
    }
  }

  async getQuizHistory(userId: string): Promise<ChallengeResult[]> {
    return apiClient.getChallengeHistory(userId);
  }

  // Check if the user has completed today's challenge
  async hasDailyChallengeCompleted(userId: string): Promise<boolean> {
    try {
      const completionData = await retrieveData<Record<string, string>>(
        this.DAILY_CHALLENGE_KEY
      );
      if (!completionData) return false;

      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const userLastCompletion = completionData[userId];

      return userLastCompletion === today;
    } catch (error) {
      console.error("Error checking daily challenge status:", error);
      return false;
    }
  }

  // Set the daily challenge as completed for today
  async setDailyChallengeCompleted(userId: string): Promise<void> {
    try {
      const completionData =
        (await retrieveData<Record<string, string>>(
          this.DAILY_CHALLENGE_KEY
        )) || {};
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      completionData[userId] = today;
      await storeData(this.DAILY_CHALLENGE_KEY, completionData);
    } catch (error) {
      console.error("Error setting daily challenge completion:", error);
    }
  }

  // Reset the daily challenge completion status for debugging purposes
  async resetDailyChallengeStatus(userId: string): Promise<void> {
    try {
      const completionData = await retrieveData<Record<string, string>>(
        this.DAILY_CHALLENGE_KEY
      );
      if (!completionData) return;

      // Remove user's entry if it exists
      if (completionData[userId]) {
        delete completionData[userId];
        await storeData(this.DAILY_CHALLENGE_KEY, completionData);
        console.log("Daily challenge status reset for user:", userId);
      }
    } catch (error) {
      console.error("Error resetting daily challenge status:", error);
    }
  }
}

export default new ChallengeService();
