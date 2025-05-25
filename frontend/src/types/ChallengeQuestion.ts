export enum ChallengeQuestionType {
  MultipleChoice = 0,
  TrueFalse = 1,
  FillInTheBlank = 2,
  RearrangeTheSentence = 3,
  IdentifyTheError = 4,
  IdentifyThePartOfSpeech = 5,
}

export interface ChallengeQuestionResponse {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  exampleSentence?: string;
  type: ChallengeQuestionType;
  flashcardId?: string;
}

export interface GetReviewChallengeQuestionsRequest {
  /** Optional user ID override. If not provided, the authenticated user's ID will be used. */
  userId?: string;
  /** Number of challenge questions to generate (default: 10, max: 50) */
  count?: number;
  /** Optional category ID to filter flashcards by specific category */
  categoryId?: string;
  /** Optional difficulty level to filter flashcards by difficulty (0=Basic, 1=Intermediate, 2=Advanced) */
  difficulty?: number;
}
