/**
 * Response returned by the API for user chat statistics
 */
export interface UserChatStatsResponse {
  /**
   * Date of last message sent
   */
  lastChatDate: string;

  /**
   * Number of messages sent today
   */
  todayMessageCount: number;

  /**
   * Total number of messages sent all-time
   */
  totalMessageCount: number;

  /**
   * Maximum number of messages allowed per day for free users
   */
  maxFreeMessagesPerDay: number;

  /**
   * Whether the user has reached their daily message limit
   */
  hasReachedDailyLimit: boolean;
}

/**
 * Request to track a chat message
 */
export interface TrackMessageRequest {
  /**
   * Optional user ID. If not provided, the authenticated user's ID will be used.
   */
  userId?: string;

  /**
   * The session ID for the chat conversation.
   */
  sessionId?: string;
}
