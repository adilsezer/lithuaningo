export enum DifficultyLevel {
  Basic = 0,
  Intermediate = 1,
  Advanced = 2,
}

export enum FlashcardCategory {
  AllCategories = -1,
  // Grammatical Categories (starting from 1000 to avoid overlap)
  Verb = 1000,
  Noun = 1001,
  Adjective = 1002,
  Adverb = 1003,
  Pronoun = 1004,
  Connector = 1005,
  // Thematic Categories (starting from 2000)
  Greeting = 2000,
  Phrase = 2001,
  Number = 2002,
  TimeWord = 2003,
  Food = 2004,
  Travel = 2005,
  Family = 2006,
  Work = 2007,
  Nature = 2008,
}

// Add category type enum for navigation
export enum CategoryType {
  DIFFICULTY = "difficulty",
  FLASHCARD_CATEGORY = "flashcard_category",
}

// Helper interface for navigation
export interface CategoryNavigationItem {
  id: string;
  type: CategoryType;
  value: number;
}

export interface FlashcardRequest {
  primaryCategory: FlashcardCategory;
  count: number;
  userId?: string;
  difficulty: DifficultyLevel;
  generateImages: boolean;
  generateAudio: boolean;
}

export interface FlashcardResponse {
  id: string;
  frontText: string;
  backText: string;
  exampleSentence: string;
  exampleSentenceTranslation: string;
  imageUrl: string;
  audioUrl: string;
  notes: string;
  categories: FlashcardCategory[];
  difficulty: DifficultyLevel;
  isVerified: boolean;
}

export interface UpdateFlashcardAdminRequest {
  frontText: string;
  backText: string;
  exampleSentence?: string;
  exampleSentenceTranslation?: string;
  imageUrl?: string;
  audioUrl?: string;
  notes?: string;
  categories: FlashcardCategory[];
  difficulty: DifficultyLevel;
  isVerified: boolean;
}
