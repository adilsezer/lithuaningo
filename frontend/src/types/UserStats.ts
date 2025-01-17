export interface UserStats {
  userId: string;
  level: number;
  experiencePoints: number;
  dailyStreak: number;
  lastStreakUpdate: Date;
  totalWordsLearned: number;
  learnedWordIds: string[];
  totalQuizzesCompleted: number;
  todayAnsweredQuestions: number;
  todayCorrectAnsweredQuestions: number;
  lastActivityTime: Date;
}
