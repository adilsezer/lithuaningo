import apiClient from "../api/apiClient";

export interface PracticeProgress {
  userId: string;
  deckId: string;
  flashcardId: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface PracticeStats {
  totalCards: number;
  masteredCards: number;
  needsPractice: number;
  lastPracticed: string;
}

class PracticeService {
  async trackProgress(progress: Omit<PracticeProgress, "timestamp">) {
    return apiClient.trackPracticeProgress(progress);
  }

  async getPracticeStats(deckId: string, userId: string) {
    return apiClient.getPracticeStats(deckId, userId);
  }

  async getPracticeHistory(userId: string) {
    return apiClient.getPracticeHistory(userId);
  }
}

export default new PracticeService();
