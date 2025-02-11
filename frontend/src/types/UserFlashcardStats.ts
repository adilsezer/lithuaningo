export interface UserFlashcardStats {
  id: string;
  deckId: string;
  userId: string;
  totalReviewed: number;
  correctAnswers: number;
  accuracyRate: number;
  lastReviewedAt: string;
  lastReviewedTimeAgo: string;
  nextReviewDue: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrackProgressRequest {
  flashcardId: string;
  isCorrect: boolean;
}
