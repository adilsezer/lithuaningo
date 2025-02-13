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
