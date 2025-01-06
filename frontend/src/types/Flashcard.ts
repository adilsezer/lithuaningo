export interface Flashcard {
  id?: string;
  deckId: string;
  front: string;
  back: string;
  audioUrl?: string;
  exampleSentence?: string;
  createdBy: string;
  createdAt: string;
}
