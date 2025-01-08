import apiClient from "../api/apiClient";

export interface QuizResult {
  deckId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

class QuizService {
  async startQuiz(deckId: string) {
    return apiClient.startDeckQuiz(deckId);
  }

  async submitQuizResult(result: Omit<QuizResult, "completedAt">) {
    return apiClient.submitDeckQuizResult(result);
  }

  async getQuizHistory(userId: string) {
    return apiClient.getDeckQuizHistory(userId);
  }
}

export default new QuizService();
