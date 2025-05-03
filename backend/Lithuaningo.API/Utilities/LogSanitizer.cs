using System.Text.RegularExpressions;
using System.Web;

namespace Lithuaningo.API.Utilities
{
    /// <summary>
    /// Utility class for sanitizing values before logging to prevent log injection/forging attacks
    /// </summary>
    public static class LogSanitizer
    {
        private static readonly Regex NewlinePattern = new(@"[\r\n]", RegexOptions.Compiled);

        /// <summary>
        /// Sanitizes a string value for safe logging
        /// </summary>
        /// <param name="input">The input string to sanitize</param>
        /// <returns>A sanitized string safe for logging</returns>
        public static string SanitizeForLog(string? input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return string.Empty;
            }

            // Remove any newlines that could break log formatting
            string sanitized = NewlinePattern.Replace(input, " ");

            // Limit length to prevent log flooding
            if (sanitized.Length > 1000)
            {
                sanitized = sanitized[..997] + "...";
            }

            return sanitized;
        }

        /// <summary>
        /// Sanitizes a user ID for safe logging
        /// </summary>
        /// <param name="userId">The user ID to sanitize</param>
        /// <returns>A sanitized user ID safe for logging</returns>
        public static string SanitizeUserId(string? userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return "[empty-user-id]";
            }

            if (Guid.TryParse(userId, out _))
            {
                // If it's a valid GUID, it's already safe for logging
                return userId;
            }

            // For non-GUID user IDs, apply general sanitization
            return SanitizeForLog(userId);
        }
    }
}