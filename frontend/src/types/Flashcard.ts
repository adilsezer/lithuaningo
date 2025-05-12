export enum DifficultyLevel {
  Basic = 0,
  Intermediate = 1,
  Advanced = 2,
}

export enum FlashcardCategory {
  AllCategories = -1,
  // Grammatical Categories
  Verb = 0,
  Noun = 1,
  Adjective = 2,
  Adverb = 3,
  Pronoun = 4,
  Connector = 5,
  // Thematic Categories
  Greeting = 100,
  Phrase = 101,
  Number = 102,
  TimeWord = 103,
  Food = 104,
  Travel = 105,
  Family = 106,
  Work = 107,
  Nature = 108,
}

export interface FlashcardRequest {
  primaryCategory: FlashcardCategory;
  count: number;
  userId?: string;
  difficulty: DifficultyLevel;
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
