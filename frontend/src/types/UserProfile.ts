export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  learnedSentences: string[];
  todayAnsweredQuestions: number;
  todayCorrectAnsweredQuestions: number;
  lastCompleted: Date;
  isAdmin: boolean;
  hasPurchasedExtraContent: boolean;
}
