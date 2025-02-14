export interface UserChallengeStats {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastChallengeDate: string;
  hasCompletedTodayChallenge: boolean;
  todayCorrectAnswers: number;
  todayIncorrectAnswers: number;
  totalChallengesCompleted: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserChallengeStatsRequest {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  todayCorrectAnswers: number;
  todayIncorrectAnswers: number;
  totalChallengesCompleted: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
}

export interface UpdateUserChallengeStatsRequest {
  currentStreak: number;
  longestStreak: number;
  todayCorrectAnswers: number;
  todayIncorrectAnswers: number;
  totalChallengesCompleted: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
}
