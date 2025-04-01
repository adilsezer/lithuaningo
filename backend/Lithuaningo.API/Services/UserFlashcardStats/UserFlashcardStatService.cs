using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using static Supabase.Postgrest.Constants;

namespace Lithuaningo.API.Services
{
    public class UserFlashcardStatService : IUserFlashcardStatService
    {
        private readonly ILogger<UserFlashcardStatService> _logger;
        private readonly ISupabaseService _supabaseService;

        public UserFlashcardStatService(
            ISupabaseService supabaseService,
            ILogger<UserFlashcardStatService> logger)
        {
            _supabaseService = supabaseService ?? throw new ArgumentNullException(nameof(supabaseService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc />
        public async Task<HashSet<Guid>> GetShownFlashcardIdsAsync(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    throw new ArgumentNullException(nameof(userId));
                }

                var userFlashcardStatsQuery = _supabaseService.Client
                    .From<UserFlashcardStat>()
                    .Filter("user_id", Operator.Equals, userId.ToString())
                    .Select("flashcard_id");

                var userFlashcardStats = await userFlashcardStatsQuery.Get();

                // Get the set of flashcard IDs to exclude (ones user has already seen)
                return userFlashcardStats.Models?
                    .Select(s => s.FlashcardId)
                    .ToHashSet() ?? new HashSet<Guid>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting shown flashcard IDs for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task MarkFlashcardsAsShownAsync(List<Flashcard> flashcards, string userId)
        {
            try
            {
                if (flashcards == null || !flashcards.Any())
                {
                    return;
                }

                if (string.IsNullOrEmpty(userId))
                {
                    throw new ArgumentNullException(nameof(userId));
                }

                var now = DateTime.UtcNow;
                var userFlashcardStats = new List<UserFlashcardStat>();

                foreach (var flashcard in flashcards)
                {
                    userFlashcardStats.Add(new UserFlashcardStat
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        FlashcardId = flashcard.Id,
                        ViewCount = 1,
                        MasteryLevel = 0
                    });
                }

                // Insert the user flashcard stats
                var result = await _supabaseService.Client
                    .From<UserFlashcardStat>()
                    .Insert(userFlashcardStats);

                if (result.Models == null || result.Models.Count != userFlashcardStats.Count)
                {
                    _logger.LogWarning("Failed to create user flashcard stats for some flashcards");
                }
                else
                {
                    _logger.LogInformation("Successfully marked {Count} flashcards as shown to user {UserId}",
                        flashcards.Count, userId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking flashcards as shown to user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<UserFlashcardStat> UpdateFlashcardStatsAsync(Guid flashcardId, string userId, bool wasCorrect)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    throw new ArgumentNullException(nameof(userId));
                }

                // Find the existing stat
                var existingStatQuery = _supabaseService.Client
                    .From<UserFlashcardStat>()
                    .Filter("user_id", Operator.Equals, userId.ToString())
                    .Filter("flashcard_id", Operator.Equals, flashcardId.ToString());

                var existingStatResult = await existingStatQuery.Get();

                // Create or update the stat
                if (existingStatResult.Models == null || !existingStatResult.Models.Any())
                {
                    // Create new stat if it doesn't exist
                    var newStat = new UserFlashcardStat
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        FlashcardId = flashcardId,
                        ViewCount = 1,
                        CorrectCount = wasCorrect ? 1 : 0,
                        IncorrectCount = wasCorrect ? 0 : 1,
                        LastAnsweredCorrectly = wasCorrect,
                        MasteryLevel = wasCorrect ? 1 : 0
                    };

                    var insertResult = await _supabaseService.Client
                        .From<UserFlashcardStat>()
                        .Insert(newStat);

                    return insertResult.Models?.FirstOrDefault() ?? newStat;
                }
                else
                {
                    // Update the existing stat
                    var existingStat = existingStatResult.Models.First();

                    existingStat.ViewCount++;
                    existingStat.LastAnsweredCorrectly = wasCorrect;

                    if (wasCorrect)
                    {
                        existingStat.CorrectCount++;
                        if (existingStat.MasteryLevel < 5)
                        {
                            existingStat.MasteryLevel++;
                        }
                    }
                    else
                    {
                        existingStat.IncorrectCount++;
                        if (existingStat.MasteryLevel > 0)
                        {
                            existingStat.MasteryLevel--;
                        }
                    }

                    var updateResult = await _supabaseService.Client
                        .From<UserFlashcardStat>()
                        .Update(existingStat);

                    return updateResult.Models?.FirstOrDefault() ?? existingStat;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating flashcard stats for user {UserId} and flashcard {FlashcardId}",
                    userId, flashcardId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<UserFlashcardStat>> GetFlashcardsDueForReviewAsync(string userId, IEnumerable<Guid>? flashcardIds = null, int limit = 20)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    throw new ArgumentNullException(nameof(userId));
                }

                var query = _supabaseService.Client
                    .From<UserFlashcardStat>()
                    .Filter("user_id", Operator.Equals, userId.ToString())
                    .Order("mastery_level", Ordering.Ascending) // Prioritize lower mastery level cards
                    .Order("view_count", Ordering.Ascending) // Then prioritize less viewed cards
                    .Limit(limit);

                // If specific flashcard IDs are provided, filter to only those
                if (flashcardIds != null && flashcardIds.Any())
                {
                    var flashcardIdObjects = new List<object>();
                    foreach (var id in flashcardIds)
                    {
                        flashcardIdObjects.Add(id.ToString());
                    }
                    query = query.Filter("flashcard_id", Operator.In, flashcardIdObjects);
                }

                var result = await query.Get();
                return result.Models?.ToList() ?? new List<UserFlashcardStat>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting flashcards due for review for user {UserId}", userId);
                throw;
            }
        }
    }
}