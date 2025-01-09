import { Deck } from "@src/types";

export interface DeckActions {
  onVote: (isUpvote: boolean) => void;
  onReport: () => void;
  onComment: (deckId: string) => void;
  onQuiz: (deckId: string) => void;
  onPractice: (deckId: string) => void;
}

export interface DeckCardProps {
  deck: Deck;
  rating: number;
  actions: DeckActions;
}
