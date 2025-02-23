import { ImageFile } from "./ImageFile";

export interface Flashcard {
  id: string;
  deckId: string;
  frontWord: string;
  backWord: string;
  exampleSentence: string;
  exampleSentenceTranslation: string;
  imageUrl: string;
  audioUrl: string;
  // Frontend-specific properties for UI/UX
  frontText?: string; // Deprecated: Use frontWord instead
  backText?: string; // Deprecated: Use backWord instead
  reviewCount: number;
  lastReviewedAt: string | null;
  lastReviewedTimeAgo: string | null;
  correctRate: number | null;
  timeAgo: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlashcardRequest {
  deckId: string;
  frontWord: string;
  backWord: string;
  exampleSentence: string;
  exampleSentenceTranslation: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface UpdateFlashcardRequest {
  frontWord: string;
  backWord: string;
  exampleSentence: string;
  exampleSentenceTranslation: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface FlashcardFormData {
  frontWord: string;
  backWord: string;
  exampleSentence: string;
  exampleSentenceTranslation: string;
  imageFile?: ImageFile;
  audioFile?: ImageFile; // Using ImageFile type as it has the same structure needed for audio files
}
