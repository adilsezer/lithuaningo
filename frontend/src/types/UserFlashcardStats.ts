export interface SubmitFlashcardAnswerRequest {
  flashcardId: string;
  wasCorrect: boolean;
  userId?: string;
}

export interface UserFlashcardStatResponse {
  id: string;
  userId: string;
  flashcardId: string;
  viewCount: number;
  correctCount: number;
  incorrectCount: number;
  lastAnsweredCorrectly: boolean | null;
  masteryLevel: number;
}

export interface UserFlashcardStatsSummaryResponse {
  userId: string;
  totalFlashcards: number;
  totalViews: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  averageMasteryLevel: number;
  flashcardsViewedToday: number;
  successRate: number;
}
