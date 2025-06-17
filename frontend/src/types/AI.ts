/**
 * Request object for AI services
 */
export interface AIRequest {
  /**
   * The text prompt to send to the AI
   */
  prompt: string;

  /**
   * The type of AI service to use (e.g., "chat", "translation", "grammar")
   * Default is "chat"
   */
  serviceType?: string;

  /**
   * Optional context or additional parameters for the AI request
   */
  context?: Record<string, string>;
}

/**
 * Response from AI services
 */
export interface AIResponse {
  /**
   * The response text from the AI
   */
  response: string;

  /**
   * Timestamp of the response in ISO string format
   */
  timestamp: string;

  /**
   * Type of AI service that provided the response
   */
  serviceType: string;
}

export interface QuestionExplanationRequest {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  options: string[];
  exampleSentence?: string;
  questionType: string;
}
