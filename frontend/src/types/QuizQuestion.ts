import { QuestionType } from "./QuestionType";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  exampleSentence?: string;
  type: QuestionType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizQuestionRequest {
  question: string;
  options: string[];
  correctAnswer: string;
  exampleSentence?: string;
  type: QuestionType;
}

export interface QuizResult {
  deckId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}
