export interface DeckVote {
  id: string;
  deckId: string;
  userId: string;
  isUpvote: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeckVoteRequest {
  deckId: string;
  userId: string;
  isUpvote: boolean;
}
