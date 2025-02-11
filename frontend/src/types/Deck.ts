export interface Deck {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  createdBy: string;
  createdByUserName: string;
  isPublic: boolean;
  cardCount: number;
  rating: number;
  timeAgo: string;
  createdAt: string;
  updatedAt: string;
}
