using AutoMapper;
using Lithuaningo.API.DTOs.UserFlashcardStats;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Supabase;
using Lithuaningo.API.Utilities;
using static Supabase.Postgrest.Constants;

namespace Lithuaningo.API.Services.Stats
{
    public class UserFlashcardStatService : IUserFlashcardStatService
    {
        private readonly ILogger<UserFlashcardStatService> _logger;
        private readonly ISupabaseService _supabaseService;
        private readonly IMapper _mapper;
        private readonly ICacheService _cache;
        private readonly ICacheSettingsService _cacheSettingsService;
        private readonly CacheInvalidator _cacheInvalidator;
        private const string CacheKeyPrefix = "flashcard-stats:";
        private const string SummaryCacheKeyPrefix = "flashcard-stats-summary:";

        public UserFlashcardStatService(
            ISupabaseService supabaseService,
            ILogger<UserFlashcardStatService> logger,
            IMapper mapper,
            ICacheService cache,
            ICacheSettingsService cacheSettingsService,
            CacheInvalidator cacheInvalidator)
        {
            _supabaseService = supabaseService ?? throw new ArgumentNullException(nameof(supabaseService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _cacheSettingsService = cacheSettingsService ?? throw new ArgumentNullException(nameof(cacheSettingsService));
            _cacheInvalidator = cacheInvalidator ?? throw new ArgumentNullException(nameof(cacheInvalidator));
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

                // This is a helper method and doesn't need caching since it's used internally

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
                _logger.LogError(ex, "Error getting shown flashcard IDs");
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

                    // Invalidate cache when creating a new stat
                    await _cacheInvalidator.InvalidateUserFlashcardStatsAsync(userId);
                    _logger.LogInformation("Invalidated flashcard stats cache after creating new stat");

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

                    // Invalidate cache when updating a stat
                    await _cacheInvalidator.InvalidateUserFlashcardStatsAsync(userId);
                    _logger.LogInformation("Invalidated flashcard stats cache after updating stat");

                    return _mapper.Map<UserFlashcardStatResponse>(resultStat);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating flashcard stats");
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

                // Generate a cache key that includes the query parameters
                string flashcardIdsParam = flashcardIds != null ? string.Join(",", flashcardIds) : "all";
                var cacheKey = $"{CacheKeyPrefix}{userId}:due:limit={limit}:ids={flashcardIdsParam}";

                // Try to get from cache first
                var cached = await _cache.GetAsync<List<UserFlashcardStatResponse>>(cacheKey);

                if (cached != null)
                {
                    _logger.LogInformation("Retrieved flashcards due for review from cache");
                    return cached;
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
                var response = _mapper.Map<List<UserFlashcardStatResponse>>(models);

                // Cache the result
                var settings = await _cacheSettingsService.GetCacheSettingsAsync();
                await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(settings.DefaultExpirationMinutes));
                _logger.LogInformation("Cached flashcards due for review");

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting flashcards due for review");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<UserFlashcardStatsSummaryResponse> GetUserFlashcardStatsSummaryAsync(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    throw new ArgumentNullException(nameof(userId));
                }

                // Try to get from cache first
                var cacheKey = $"{SummaryCacheKeyPrefix}{userId}";
                var cached = await _cache.GetAsync<UserFlashcardStatsSummaryResponse>(cacheKey);

                if (cached != null)
                {
                    _logger.LogInformation("Retrieved flashcard stats summary from cache");
                    return cached;
                }

                // Get all flashcard stats for the user
                var query = _supabaseService.Client
                    .From<UserFlashcardStat>()
                    .Filter("user_id", Operator.Equals, userId.ToString());

                var result = await query.Get();
                var models = result.Models?.ToList() ?? new List<UserFlashcardStat>();

                // Get a separate count of flashcards answered today using database filtering
                var today = DateTime.UtcNow.Date;
                var todayStart = today.ToString("yyyy-MM-dd");
                var todayEnd = today.AddDays(1).ToString("yyyy-MM-dd");

                // Just count directly
                var todayQuery = _supabaseService.Client
                    .From<UserFlashcardStat>()
                    .Filter("user_id", Operator.Equals, userId.ToString())
                    .Filter("updated_at", Operator.GreaterThanOrEqual, todayStart)
                    .Filter("updated_at", Operator.LessThan, todayEnd);

                var todayResult = await todayQuery.Get();

                // Count cards that have been answered (either correctly or incorrectly)
                var todayCount = todayResult.Models?.Count(s => s.CorrectCount > 0 || s.IncorrectCount > 0) ?? 0;

                _logger.LogInformation("User has answered flashcards today (database query)");

                // Use AutoMapper to map the collection to the summary response
                var summary = _mapper.Map<UserFlashcardStatsSummaryResponse>(models);

                // Override the AutoMapper value with our database query result
                summary.FlashcardsAnsweredToday = todayCount;

                // Cache the result
                var settings = await _cacheSettingsService.GetCacheSettingsAsync();
                await _cache.SetAsync(cacheKey, summary, TimeSpan.FromMinutes(settings.DefaultExpirationMinutes));
                _logger.LogInformation("Cached flashcard stats summary");

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user flashcard stats summary");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<UserFlashcardStatResponse> GetFlashcardStatsAsync(string userId, string flashcardId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(flashcardId))
                {
                    throw new ArgumentNullException(nameof(userId));
                    throw new ArgumentNullException(nameof(flashcardId));
                }

                // Generate a specific cache key for this user+flashcard combination
                var cacheKey = $"{CacheKeyPrefix}{userId}:card:{flashcardId}";

                // Try to get from cache first
                var cached = await _cache.GetAsync<UserFlashcardStatResponse>(cacheKey);

                if (cached != null)
                {
                    _logger.LogInformation("Retrieved flashcard stats from cache");
                    return cached;
                }

                var query = _supabaseService.Client
                    .From<UserFlashcardStat>()
                    .Filter("user_id", Operator.Equals, userId)
                    .Filter("flashcard_id", Operator.Equals, flashcardId);

                var result = await query.Get();
                var models = result.Models?.ToList() ?? new List<UserFlashcardStat>();

                var response = _mapper.Map<UserFlashcardStatResponse>(models.FirstOrDefault());

                // Cache the result if we have a response (not null)
                if (response != null)
                {
                    var settings = await _cacheSettingsService.GetCacheSettingsAsync();
                    await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(settings.DefaultExpirationMinutes));
                    _logger.LogInformation("Cached flashcard stats");
                    return response;
                }

                // Return empty response object instead of null
                return new UserFlashcardStatResponse
                {
                    UserId = userId,
                    FlashcardId = Guid.Parse(flashcardId),
                    ViewCount = 0,
                    CorrectCount = 0,
                    IncorrectCount = 0,
                    MasteryLevel = 0,
                    LastAnsweredCorrectly = false
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting flashcard stats");
                throw;
            }
        }
    }
}