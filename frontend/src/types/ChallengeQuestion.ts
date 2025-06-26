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
  /** Optional difficulty level to filter flashcards by difficulty (Basic=0, Intermediate=1, Advanced=2). If not provided, challenges from all difficulty levels will be included. */
  difficulty?: number;
}

export interface NextChallengeTimeResponse {
  /** The current server time in UTC */
  currentTimeUtc: string;
  /** When the next daily challenge becomes available (00:00 UTC tomorrow) */
  nextChallengeTimeUtc: string;
  /** Number of seconds until the next challenge becomes available */
  secondsUntilNext: number;
  /** Whether a new challenge is already available (happens when it's past midnight UTC) */
  isNewChallengeAvailable: boolean;
}
