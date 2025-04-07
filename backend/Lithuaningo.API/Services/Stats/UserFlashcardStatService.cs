using AutoMapper;
using Lithuaningo.API.DTOs.UserFlashcardStats;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Supabase;
using static Supabase.Postgrest.Constants;

namespace Lithuaningo.API.Services.Stats
{
    public class UserFlashcardStatService : IUserFlashcardStatService
    {
        private readonly ILogger<UserFlashcardStatService> _logger;
        private readonly ISupabaseService _supabaseService;
        private readonly IMapper _mapper;

        public UserFlashcardStatService(
            ISupabaseService supabaseService,
            ILogger<UserFlashcardStatService> logger,
            IMapper mapper)
        {
            _supabaseService = supabaseService ?? throw new ArgumentNullException(nameof(supabaseService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
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
        public async Task<UserFlashcardStatResponse> SubmitFlashcardAnswerAsync(string userId, SubmitFlashcardAnswerRequest request)
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
                    .Filter("flashcard_id", Operator.Equals, request.FlashcardId.ToString());

                var existingStatResult = await existingStatQuery.Get();

                // Create or update the stat
                if (existingStatResult.Models == null || existingStatResult.Models.Count == 0)
                {
                    // Create new stat if it doesn't exist
                    var newStat = new UserFlashcardStat
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        FlashcardId = request.FlashcardId,
                        ViewCount = 1,
                        CorrectCount = request.WasCorrect ? 1 : 0,
                        IncorrectCount = request.WasCorrect ? 0 : 1,
                        LastAnsweredCorrectly = request.WasCorrect,
                        MasteryLevel = request.WasCorrect ? 1 : 0
                    };

                    var insertResult = await _supabaseService.Client
                        .From<UserFlashcardStat>()
                        .Insert(newStat);

                    var resultStat = insertResult.Models?.FirstOrDefault() ?? newStat;
                    return _mapper.Map<UserFlashcardStatResponse>(resultStat);
                }
                else
                {
                    // Update the existing stat
                    var existingStat = existingStatResult.Models.First();

                    existingStat.ViewCount++;
                    existingStat.LastAnsweredCorrectly = request.WasCorrect;

                    if (request.WasCorrect)
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

                    var resultStat = updateResult.Models?.FirstOrDefault() ?? existingStat;
                    return _mapper.Map<UserFlashcardStatResponse>(resultStat);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating flashcard stats for user {UserId} and flashcard {FlashcardId}",
                    userId, request.FlashcardId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<UserFlashcardStatResponse>> GetFlashcardsDueForReviewAsync(string userId, IEnumerable<Guid>? flashcardIds = null, int limit = 20)
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
                var models = result.Models?.ToList() ?? new List<UserFlashcardStat>();

                // Map to response DTOs
                return _mapper.Map<List<UserFlashcardStatResponse>>(models);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting flashcards due for review for user {UserId}", userId);
                throw;
            }
        }
    }
}