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
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export enum QuestionType {
  MultipleChoice = "MultipleChoice",
  TrueFalse = "TrueFalse",
  FillInTheBlank = "FillInTheBlank",
  RearrangeTheSentence = "RearrangeTheSentence",
  IdentifyTheError = "IdentifyTheError",
  IdentifyThePartOfSpeech = "IdentifyThePartOfSpeech",
}
