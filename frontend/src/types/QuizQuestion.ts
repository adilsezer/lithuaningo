import { QuestionType } from "@src/types/QuestionType";

export interface QuizQuestion {
  questionType: QuestionType;
  questionText: string;
  exampleSentence: string;
  correctAnswer: string;
  options: string[];
}
