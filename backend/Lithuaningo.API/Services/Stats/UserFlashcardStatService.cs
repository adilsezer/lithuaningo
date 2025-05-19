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

        /// <summary>
        /// Helper method to get an existing UserFlashcardStat or create a new one with default values if it doesn't exist.
        /// </summary>
        private async Task<UserFlashcardStat> GetOrCreateUserFlashcardStatAsync(string userId, Guid flashcardId)
        {
            var existingStatQuery = _supabaseService.Client
                .From<UserFlashcardStat>()
                .Filter("user_id", Operator.Equals, userId.ToString())
                .Filter("flashcard_id", Operator.Equals, flashcardId.ToString());

            var existingStatResult = await existingStatQuery.Get();
            var existingStat = existingStatResult.Models?.FirstOrDefault();

            if (existingStat != null)
            {
                return existingStat;
            }
            else
            {
                var newStat = new UserFlashcardStat
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    FlashcardId = flashcardId,
                    ViewCount = 0,
                    CorrectCount = 0,
                    IncorrectCount = 0,
                    LastAnsweredCorrectly = null,
                    MasteryLevel = 0
                };
                return newStat;
            }
        }

        /// <inheritdoc />
        public async Task<UserFlashcardStatResponse> IncrementFlashcardViewCountAsync(string userId, Guid flashcardId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    throw new ArgumentNullException(nameof(userId));
                }

                var statEntity = await GetOrCreateUserFlashcardStatAsync(userId, flashcardId);
                statEntity.ViewCount++;

                // Upsert the entity (Insert if new, Update if existing)
                var upsertResult = await _supabaseService.Client
                    .From<UserFlashcardStat>()
                    .Upsert(statEntity);

                var resultStat = upsertResult.Models?.FirstOrDefault() ?? statEntity;

                // Invalidate cache
                await _cacheInvalidator.InvalidateUserFlashcardStatsAsync(userId);
                var cacheKey = $"{CacheKeyPrefix}{userId}:card:{flashcardId}";
                await _cache.RemoveAsync(cacheKey);

                return _mapper.Map<UserFlashcardStatResponse>(resultStat);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing flashcard view count for user {UserId}, flashcard {FlashcardId}", userId, flashcardId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<Guid>> GetLastSeenFlashcardIdsAsync(string userId, int count = 10)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    throw new ArgumentNullException(nameof(userId));
                }

                // This method is for fetching IDs for review challenges, typically not cached
                // as it needs to be fresh. If caching is desired later, it can be added.

                var query = _supabaseService.Client
                    .From<UserFlashcardStat>()
                    .Filter("user_id", Operator.Equals, userId.ToString())
                    .Order("updated_at", Ordering.Descending)
                    .Limit(count)
                    .Select("flashcard_id");

                var result = await query.Get();

                return result.Models?
                    .Select(s => s.FlashcardId)
                    .ToList() ?? new List<Guid>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting last seen flashcard IDs for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<HashSet<Guid>> GetAllUserInteractedFlashcardIdsAsync(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    throw new ArgumentNullException(nameof(userId));
                }

                // This fetches all unique flashcard IDs a user has interacted with.
                // It's used to determine 'new' vs 'seen' cards in learning mode.
                // Caching could be considered if this becomes a performance issue,
                // but it needs to be invalidated whenever a user interacts with a new card.
                // For now, direct fetch is simpler.

                var query = _supabaseService.Client
                    .From<UserFlashcardStat>()
                    .Filter("user_id", Operator.Equals, userId.ToString())
                    .Select("flashcard_id"); // Select only the flashcard_id

                var result = await query.Get();

                return result.Models?
                    .Select(s => s.FlashcardId)
                    .ToHashSet() ?? new HashSet<Guid>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all interacted flashcard IDs for user {UserId}", userId);
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

                var statEntity = await GetOrCreateUserFlashcardStatAsync(userId, request.FlashcardId);

                // Update the stat based on the answer
                statEntity.LastAnsweredCorrectly = request.WasCorrect;

                if (request.WasCorrect)
                {
                    statEntity.CorrectCount++;
                    if (statEntity.MasteryLevel < 5) // Assuming max mastery level is 5
                    {
                        statEntity.MasteryLevel++;
                    }
                }
                else
                {
                    statEntity.IncorrectCount++;
                    if (statEntity.MasteryLevel > 0) // Assuming min mastery level is 0
                    {
                        statEntity.MasteryLevel--;
                    }
                }

                // Upsert the entity (Insert if new, Update if existing)
                var upsertResult = await _supabaseService.Client
                    .From<UserFlashcardStat>()
                    .Upsert(statEntity);

                var resultStat = upsertResult.Models?.FirstOrDefault() ?? statEntity;

                // Invalidate cache
                await _cacheInvalidator.InvalidateUserFlashcardStatsAsync(userId);
                var cacheKey = $"{CacheKeyPrefix}{userId}:card:{request.FlashcardId}";
                await _cache.RemoveAsync(cacheKey);

                return _mapper.Map<UserFlashcardStatResponse>(resultStat);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting flashcard answer for user {UserId}, flashcard {FlashcardId}", userId, request.FlashcardId);
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

                // Count distinct flashcards that had their UserFlashcardStat record updated today
                var flashcardsViewedTodayCount = todayResult.Models?
                    .Select(s => s.FlashcardId)
                    .Distinct()
                    .Count() ?? 0;

                // Use AutoMapper to map the collection to the summary response
                var summary = _mapper.Map<UserFlashcardStatsSummaryResponse>(models);

                // Override the AutoMapper value with our database query result
                summary.FlashcardsViewedToday = flashcardsViewedTodayCount;

                // Cache the result
                var settings = await _cacheSettingsService.GetCacheSettingsAsync();
                await _cache.SetAsync(cacheKey, summary, TimeSpan.FromMinutes(settings.DefaultExpirationMinutes));

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
                    return cached;
                }

                var query = _supabaseService.Client
                    .From<UserFlashcardStat>()
                    .Filter("user_id", Operator.Equals, userId.ToString())
                    .Filter("flashcard_id", Operator.Equals, flashcardId);

                var result = await query.Get();
                var models = result.Models?.ToList() ?? new List<UserFlashcardStat>();

                var response = _mapper.Map<UserFlashcardStatResponse>(models.FirstOrDefault());

                // Cache the result if we have a response (not null)
                if (response != null)
                {
                    var settings = await _cacheSettingsService.GetCacheSettingsAsync();
                    await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(settings.DefaultExpirationMinutes));
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
                _logger.LogError(ex, "Error getting flashcard stats.");
                throw;
            }
        }
    }
}