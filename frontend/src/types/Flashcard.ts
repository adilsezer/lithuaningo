export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  audioUrl?: string;
  imageUrl?: string;
  exampleSentence?: string;
  createdBy: string;
  createdAt: Date;
}

export interface FlashcardFormData extends Omit<Flashcard, "id" | "createdAt"> {
  imageFile?: File;
  audioFile?: File;
}
