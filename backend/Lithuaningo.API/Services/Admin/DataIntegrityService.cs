using Lithuaningo.API.DTOs.Admin;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Challenges;
using Lithuaningo.API.Services.Flashcards;
using Lithuaningo.API.Services.Supabase;
using Supabase;
using static Supabase.Postgrest.Constants;

namespace Lithuaningo.API.Services.Admin
{
    /// <summary>
    /// Service for validating and fixing data integrity issues in the application.
    /// </summary>
    public class DataIntegrityService : IDataIntegrityService
    {
        private readonly IFlashcardService _flashcardService;
        private readonly IChallengeService _challengeService;
        private readonly ISupabaseService _supabaseService;
        private readonly ILogger<DataIntegrityService> _logger;

        public DataIntegrityService(
            IFlashcardService flashcardService,
            IChallengeService challengeService,
            ISupabaseService supabaseService,
            ILogger<DataIntegrityService> logger)
        {
            _flashcardService = flashcardService ?? throw new ArgumentNullException(nameof(flashcardService));
            _challengeService = challengeService ?? throw new ArgumentNullException(nameof(challengeService));
            _supabaseService = supabaseService ?? throw new ArgumentNullException(nameof(supabaseService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Validates and optionally fixes data integrity issues in flashcards and challenge questions.
        /// </summary>
        /// <param name="fixIssues">If true, automatically fixes found issues. If false, only reports issues.</param>
        /// <returns>A report of issues found and actions taken.</returns>
        public async Task<DataIntegrityReport> ValidateAndFixDataAsync(bool fixIssues)
        {
            var report = new DataIntegrityReport
            {
                FixIssues = fixIssues,
                Timestamp = DateTime.UtcNow
            };

            try
            {
                // Get all flashcards
                var allFlashcards = await _flashcardService.RetrieveFlashcardModelsAsync();
                var flashcardsList = allFlashcards.ToList();

                report.Flashcards.Total = flashcardsList.Count;

                // Validate flashcards
                await ValidateFlashcardsAsync(flashcardsList, report, fixIssues);

                // Validate challenge questions
                await ValidateChallengeQuestionsAsync(flashcardsList, report, fixIssues);

                _logger.LogInformation(
                    "Data integrity validation completed. Total flashcards: {Total}, Issues found: Images={MissingImages}, Audio={MissingAudio}, Core={MissingCoreData}, Challenges={WrongChallengeCount}",
                    report.Flashcards.Total, report.Flashcards.MissingImages, report.Flashcards.MissingAudio,
                    report.Flashcards.MissingCoreData, report.ChallengeQuestions.FlashcardsWithWrongCount);

                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ValidateAndFixDataAsync");
                report.Errors.Add($"Validation failed: {ex.Message}");
                return report;
            }
        }

        #region Private Methods

        /// <summary>
        /// Validates flashcards for missing data and optionally fixes issues.
        /// </summary>
        private async Task ValidateFlashcardsAsync(List<Flashcard> flashcards, DataIntegrityReport report, bool fixIssues)
        {
            foreach (var flashcard in flashcards)
            {
                try
                {
                    bool hasMissingCoreData = string.IsNullOrEmpty(flashcard.FrontText) ||
                                              string.IsNullOrEmpty(flashcard.BackText) ||
                                              string.IsNullOrEmpty(flashcard.ExampleSentence) ||
                                              string.IsNullOrEmpty(flashcard.ExampleSentenceTranslation) ||
                                              flashcard.Categories == null || !flashcard.Categories.Any() ||
                                              !Enum.IsDefined(typeof(DifficultyLevel), flashcard.Difficulty);

                    if (hasMissingCoreData)
                    {
                        report.Flashcards.MissingCoreData++;
                        if (fixIssues)
                        {
                            _logger.LogWarning("Flashcard {FlashcardId} has missing core data, will be deleted", flashcard.Id);
                            await DeleteFlashcardAsync(flashcard.Id);
                            report.Flashcards.DeletedDueToMissingCoreData++;
                        }
                        continue; // Skip other checks for this flashcard if core data is missing
                    }

                    bool hasMissingImage = string.IsNullOrEmpty(flashcard.ImageUrl);
                    bool hasMissingAudio = string.IsNullOrEmpty(flashcard.AudioUrl);

                    if (hasMissingImage)
                    {
                        report.Flashcards.MissingImages++;
                        if (fixIssues)
                        {
                            try
                            {
                                await _flashcardService.GenerateFlashcardImageAsync(flashcard.Id);
                                report.Flashcards.FixedImages++;
                                _logger.LogInformation("Generated missing image for flashcard {FlashcardId}", flashcard.Id);
                            }
                            catch (Exception ex)
                            {
                                var errorMsg = $"Failed to generate image for flashcard {flashcard.Id}: {ex.Message}";
                                report.Errors.Add(errorMsg);
                                _logger.LogWarning(ex, errorMsg);
                            }
                        }
                    }

                    if (hasMissingAudio)
                    {
                        report.Flashcards.MissingAudio++;
                        if (fixIssues)
                        {
                            try
                            {
                                await _flashcardService.GenerateFlashcardAudioAsync(flashcard.Id);
                                report.Flashcards.FixedAudio++;
                                _logger.LogInformation("Generated missing audio for flashcard {FlashcardId}", flashcard.Id);
                            }
                            catch (Exception ex)
                            {
                                var errorMsg = $"Failed to generate audio for flashcard {flashcard.Id}: {ex.Message}";
                                report.Errors.Add(errorMsg);
                                _logger.LogWarning(ex, errorMsg);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    var errorMsg = $"Error processing flashcard {flashcard.Id}: {ex.Message}";
                    report.Errors.Add(errorMsg);
                    _logger.LogError(ex, errorMsg);
                }
            }
        }

        /// <summary>
        /// Validates challenge questions for correct count and optionally fixes issues.
        /// </summary>
        private async Task ValidateChallengeQuestionsAsync(List<Flashcard> flashcards, DataIntegrityReport report, bool fixIssues)
        {
            foreach (var flashcard in flashcards)
            {
                try
                {
                    var challengeCount = await GetChallengeQuestionCountAsync(flashcard.Id);

                    if (challengeCount != 4)
                    {
                        report.ChallengeQuestions.FlashcardsWithWrongCount++;
                        if (fixIssues)
                        {
                            try
                            {
                                // Clear all existing challenges and regenerate
                                await _challengeService.ClearChallengesByFlashcardIdAsync(flashcard.Id);
                                await _challengeService.GenerateAndSaveChallengesForFlashcardAsync(flashcard);
                                report.ChallengeQuestions.FixedChallengeCount++;
                                _logger.LogInformation("Fixed challenge questions for flashcard {FlashcardId} (had {Count}, now has 4)", flashcard.Id, challengeCount);
                            }
                            catch (Exception ex)
                            {
                                var errorMsg = $"Failed to fix challenge questions for flashcard {flashcard.Id}: {ex.Message}";
                                report.Errors.Add(errorMsg);
                                _logger.LogWarning(ex, errorMsg);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    var errorMsg = $"Error checking challenge questions for flashcard {flashcard.Id}: {ex.Message}";
                    report.Errors.Add(errorMsg);
                    _logger.LogError(ex, errorMsg);
                }
            }
        }

        /// <summary>
        /// Gets the count of challenge questions for a specific flashcard.
        /// </summary>
        private async Task<int> GetChallengeQuestionCountAsync(Guid flashcardId)
        {
            var challenges = await _challengeService.GetChallengeQuestionsForFlashcardAsync(flashcardId);
            return challenges.Count();
        }

        /// <summary>
        /// Deletes a flashcard from the database (cascade deletes challenge questions).
        /// </summary>
        private async Task DeleteFlashcardAsync(Guid flashcardId)
        {
            await _supabaseService.Client
                .From<Flashcard>()
                .Filter("id", Operator.Equals, flashcardId.ToString())
                .Delete();
        }

        #endregion
    }
}