export type { Announcement } from "./Announcement";
export type { AppInfo } from "./AppInfo";
export type { DeckComment } from "./DeckComment";
export * from "./LeaderboardModels";
export type { Lemma } from "./Lemma";
export { QuestionType } from "./QuestionType";
export * from "./QuizQuestion";
export type {
  QuizQuestion,
  CreateQuizQuestionRequest,
  QuizResult,
} from "./QuizQuestion";
export type {
  UserProfile,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
} from "./UserProfile";
export type { UserStats } from "./UserStats";
export type { WordForm } from "./WordForm";
export type { Deck } from "./Deck";
export * from "./Flashcard";
export * from "./UserFlashcardStats";

export interface UserChallengeStats {
  id: string;
  userId: string;
  cardsReviewed: number;
  cardsMastered: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  weeklyGoal: number;
  weeklyProgress: number;
  createdAt: string;
  updatedAt: string;
  lastActivityTimeAgo?: string;
}

export interface DeckReport {
  id: string;
  deckId: string;
  reporterId: string;
  reason: string;
  details: string;
  status: "pending" | "resolved" | "rejected";
  reviewedBy?: string;
  reviewedByUserName?: string;
  reportedByUserName: string;
  resolution?: string;
  timeAgo: string;
  createdAt: string;
  updatedAt: string;
}
