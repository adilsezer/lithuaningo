export interface SubmitChallengeAnswerRequest {
  wasCorrect: boolean;
  challengeId: string;
  userId?: string;
}

export interface UserChallengeStatsResponse {
  currentStreak: number;
  longestStreak: number;
  lastChallengeDate: string;
  hasCompletedTodayChallenge: boolean;
  todayCorrectAnswers: number;
  todayIncorrectAnswers: number;
  totalChallengesCompleted: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  todayTotalAnswers: number;
}
