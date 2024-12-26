import { QuestionType } from "@src/types/QuestionType";

export interface QuizQuestion {
  image: string;
  questionType: QuestionType;
  questionText: string;
  sentenceText: string;
  correctAnswer: string;
  options: string[];
}
