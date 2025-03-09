import { apiClient } from "../api/apiClient";
import {
  QuizQuestion,
  QuizResult,
  CreateQuizQuestionRequest,
} from "@src/types";

class QuizService {
  // More patient retry logic with up to 10 retries (can handle longer AI generation)
  async getDailyQuiz(retryCount = 0, maxRetries = 10): Promise<QuizQuestion[]> {
    try {
      const questions = await apiClient.getDailyQuiz();

      // Return immediately if we have questions
      if (questions && questions.length > 0) {
        console.log(`Successfully fetched ${questions.length} quiz questions`);
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
          return this.getDailyQuiz(retryCount + 1, maxRetries);
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
        return this.getDailyQuiz(retryCount + 1, maxRetries);
      }

      // Re-throw the error so the component can handle it
      throw error;
    }
  }

  async createDailyQuiz(
    questions: CreateQuizQuestionRequest[]
  ): Promise<QuizQuestion[]> {
    return apiClient.createDailyQuiz(questions);
  }

  async submitQuizResult(
    result: Omit<QuizResult, "completedAt">
  ): Promise<void> {
    return apiClient.submitQuizResult(result);
  }

  async getQuizHistory(userId: string): Promise<QuizResult[]> {
    return apiClient.getQuizHistory(userId);
  }
}

export default new QuizService();
