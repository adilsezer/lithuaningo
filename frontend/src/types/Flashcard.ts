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
  notes: string;
  level: string;
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
  notes?: string;
  level?: string;
}

export interface UpdateFlashcardRequest {
  frontWord: string;
  backWord: string;
  exampleSentence: string;
  exampleSentenceTranslation: string;
  imageUrl?: string;
  audioUrl?: string;
  notes?: string;
  level?: string;
}

export interface FlashcardFormData {
  frontWord: string;
  backWord: string;
  exampleSentence: string;
  exampleSentenceTranslation: string;
  imageFile?: ImageFile | null;
  audioFile?: ImageFile | null; // Using ImageFile type as it has the same structure needed for audio files
  notes?: string;
  level?: string;
}
