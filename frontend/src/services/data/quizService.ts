import apiClient from "../api/apiClient";
import { QuizQuestion, QuizResult } from "@src/types";

class QuizService {
  async startQuiz(): Promise<QuizQuestion[]> {
    return apiClient.getDailyQuiz();
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
