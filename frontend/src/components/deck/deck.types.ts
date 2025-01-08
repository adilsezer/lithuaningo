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
  colors: any; // TODO: Type this properly with your theme types
}

export interface WithColors {
  colors: any; // TODO: Type this properly with your theme types
}

export interface DeckHeaderProps extends WithColors {
  title: string;
  category: string;
}

export interface DeckContentProps extends WithColors {
  description: string;
  tags: string[];
  createdBy: string;
  rating: number;
  isPublic: boolean;
}

export interface DeckActionsProps extends WithColors {
  deckId: string;
  onQuiz: (deckId: string) => void;
}

export interface DeckInteractionsProps extends WithColors {
  deckId: string;
  onVote: (isUpvote: boolean) => void;
  onReport: () => void;
  onComment: (deckId: string) => void;
}
