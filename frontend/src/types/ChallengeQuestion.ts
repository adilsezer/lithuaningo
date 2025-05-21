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
