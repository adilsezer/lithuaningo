export interface Deck {
  id: string;
  title: string;
  description: string;
  category: string;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  tags: string[];
}
