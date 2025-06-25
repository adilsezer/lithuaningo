namespace Lithuaningo.API.DTOs.Admin
{
    /// <summary>
    /// Report containing the results of data integrity validation and fixes.
    /// </summary>
    public class DataIntegrityReport
    {
        /// <summary>
        /// Timestamp when the validation was performed
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Whether issues were automatically fixed during validation
        /// </summary>
        public bool FixIssues { get; set; }

        /// <summary>
        /// Flashcard-related validation results
        /// </summary>
        public FlashcardValidationResult Flashcards { get; set; } = new();

        /// <summary>
        /// Challenge question-related validation results
        /// </summary>
        public ChallengeQuestionValidationResult ChallengeQuestions { get; set; } = new();

        /// <summary>
        /// List of errors encountered during validation/fixing
        /// </summary>
        public List<string> Errors { get; set; } = new();
    }

    /// <summary>
    /// Validation results specific to flashcards
    /// </summary>
    public class FlashcardValidationResult
    {
        /// <summary>
        /// Total number of flashcards checked
        /// </summary>
        public int Total { get; set; }

        /// <summary>
        /// Number of flashcards with missing images
        /// </summary>
        public int MissingImages { get; set; }

        /// <summary>
        /// Number of flashcards with missing audio
        /// </summary>
        public int MissingAudio { get; set; }

        /// <summary>
        /// Number of flashcards with missing core data
        /// </summary>
        public int MissingCoreData { get; set; }

        /// <summary>
        /// Number of images that were successfully generated/fixed
        /// </summary>
        public int FixedImages { get; set; }

        /// <summary>
        /// Number of audio files that were successfully generated/fixed
        /// </summary>
        public int FixedAudio { get; set; }

        /// <summary>
        /// Number of flashcards that were deleted due to missing core data
        /// </summary>
        public int DeletedDueToMissingCoreData { get; set; }
    }

    /// <summary>
    /// Validation results specific to challenge questions
    /// </summary>
    public class ChallengeQuestionValidationResult
    {
        /// <summary>
        /// Number of flashcards that don't have exactly 4 challenge questions
        /// </summary>
        public int FlashcardsWithWrongCount { get; set; }

        /// <summary>
        /// Number of flashcards for which challenge questions were successfully fixed
        /// </summary>
        public int FixedChallengeCount { get; set; }
    }
}