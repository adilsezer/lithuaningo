export interface Deck {
  id: string;
  title: string;
  description: string;
  category: string;
  createdBy: string;
  createdByUsername: string;
  createdAt: Date;
  tags: string[];
  flashcardCount: number;
}
