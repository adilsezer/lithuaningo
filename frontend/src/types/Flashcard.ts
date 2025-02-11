export interface Flashcard {
  id: string;
  deckId: string;
  frontText: string;
  backText: string;
  imageUrl?: string;
  audioUrl?: string;
  reviewCount: number;
  lastReviewedAt: string | null;
  lastReviewedTimeAgo: string | null;
  correctRate: number | null;
  timeAgo: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardFormData {
  frontText: string;
  backText: string;
  imageFile?: File;
  audioFile?: File;
}
