import { Sentence } from "../services/data/sentenceService";

export interface QuizState {
  sentenceText: string;
  questionText: string;
  image: string;
  translation: string;
  options: string[];
  correctAnswerText: string;
  questionType: "multipleChoice" | "fillInTheBlank" | "trueFalse";
  questionIndex: number;
  showContinueButton: boolean;
  quizCompleted: boolean;
  questionWord: string;
}

export const initializeQuizState = (): QuizState => ({
  questionText: "",
  questionWord: "",
  sentenceText: "",
  translation: "",
  image: "",
  options: [],
  correctAnswerText: "",
  questionType: "multipleChoice",
  questionIndex: 0,
  showContinueButton: false,
  quizCompleted: false,
});
