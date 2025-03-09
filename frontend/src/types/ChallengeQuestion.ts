import { QuestionType } from "./QuestionType";

export interface ChallengeQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  exampleSentence?: string;
  type: QuestionType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChallengeQuestionRequest {
  question: string;
  options: string[];
  correctAnswer: string;
  exampleSentence?: string;
  type: QuestionType;
}

export interface ChallengeResult {
  deckId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}
