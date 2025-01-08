import { QuestionType } from "@src/types/QuestionType";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}
