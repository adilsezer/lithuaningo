export interface Deck {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  rating: number;
  imageUrl?: string;
  flashcardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeckRequest {
  userId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  imageUrl?: string;
}

export interface UpdateDeckRequest {
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  imageUrl?: string;
}
