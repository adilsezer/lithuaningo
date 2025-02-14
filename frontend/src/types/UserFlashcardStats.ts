export interface UserFlashcardStats {
  id: string;
  userId: string;
  flashcardId: string;
  accuracyRate: number;
  totalReviewed: number;
  correctAnswers: number;
  lastReviewedAt: string;
  nextReviewDue: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrackProgressRequest {
  userId: string;
  flashcardId: string;
  isCorrect: boolean;
  confidenceLevel?: number;
  timeTakenSeconds: number;
}

export interface UserFlashcardStatsResponse {
  id: string;
  userId: string;
  flashcardId: string;
  accuracyRate: number;
  totalReviewed: number;
  correctAnswers: number;
  lastReviewedAt: string;
  nextReviewDue: string | null;
}
