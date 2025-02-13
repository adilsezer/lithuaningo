import { QuestionType } from "./QuestionType";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  type: QuestionType;
  createdAt: string;
}

export interface CreateQuizQuestionRequest {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface QuizResult {
  deckId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}
