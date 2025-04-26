namespace Lithuaningo.API.DTOs.UserChatStats
{
    /// <summary>
    /// Request to track a chat message
    /// </summary>
    public class TrackMessageRequest
    {
        /// <summary>
        /// Optional user ID. If not provided, the authenticated user's ID will be used.
        /// </summary>
        public string? UserId { get; set; }

        /// <summary>
        /// The session ID for the chat conversation.
        /// </summary>
        public string? SessionId { get; set; }
    }
}