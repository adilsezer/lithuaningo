import apiClient from "../api/apiClient";
import {
  QuizQuestion,
  QuizResult,
  CreateQuizQuestionRequest,
} from "@src/types";

class QuizService {
  async getDailyQuiz(): Promise<QuizQuestion[]> {
    return apiClient.getDailyQuiz();
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
