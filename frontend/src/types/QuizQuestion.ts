import { QuestionType } from "./QuestionType";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  type: QuestionType;
  quizDate: string;
  category?: string;
  difficultyLevel: number;
  createdAt: string;
}

export interface CreateQuizQuestionRequest {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  category?: string;
  difficultyLevel: number;
}

export interface QuizResult {
  deckId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}
