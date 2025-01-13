export interface Comment {
  id?: string;
  deckId: string;
  userId: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string | null;
  likes: number;
  isEdited: boolean;
}
