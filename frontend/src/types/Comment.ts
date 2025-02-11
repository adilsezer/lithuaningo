export interface Comment {
  id: string;
  deckId: string;
  userId: string;
  userName: string;
  content: string;
  timeAgo: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}
