export interface Comment {
  id: string;
  deckId: string;
  userId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
}
