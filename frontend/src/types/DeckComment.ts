export interface DeckComment {
  id: string;
  deckId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeckCommentRequest {
  deckId: string;
  userId: string;
  content: string;
}

export interface UpdateDeckCommentRequest {
  content: string;
}
