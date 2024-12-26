export interface UserProfile {
  id: string;
  name: string;
  email: string;
  learnedSentences: string[];
  todayAnsweredQuestions: number;
  todayCorrectAnsweredQuestions: number;
  todayWrongAnsweredQuestions: number;
  lastCompleted: Date;
  isAdmin: boolean;
  hasPurchasedExtraContent: boolean;
}
