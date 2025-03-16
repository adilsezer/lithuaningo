import { DeckCategory } from "./DeckCategory";
import { ImageFile } from "./ImageFile";

export interface Deck {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  imageUrl?: string;
  flashcardsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeckWithRatingResponse extends Deck {
  rating: number;
  totalVotes: number;
  upvoteCount: number;
}

export interface CreateDeckRequest {
  userId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  imageUrl?: string | null;
}

export interface UpdateDeckRequest {
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  imageUrl?: string | null;
}

export interface DeckFormData {
  title: string;
  description: string;
  category: DeckCategory;
  tags?: string;
  isPublic?: boolean;
  imageFile?: ImageFile | null;
  consent: boolean;
}

export const isDeckWithRating = (
  deck: Deck | DeckWithRatingResponse
): deck is DeckWithRatingResponse => {
  return "rating" in deck && "totalVotes" in deck && "upvoteCount" in deck;
};

export const convertFormToRequest = (
  formData: DeckFormData,
  userId: string
): CreateDeckRequest => ({
  userId,
  title: formData.title,
  description: formData.description,
  category: formData.category,
  tags:
    formData.tags
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean) ?? [],
  isPublic: formData.isPublic ?? true,
});
