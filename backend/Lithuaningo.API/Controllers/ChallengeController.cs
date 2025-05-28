using System.Security.Claims;
using Lithuaningo.API.Authorization;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.Services.Challenges;
using Lithuaningo.API.Services.UserProfile;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages challenge-related operations in the Lithuaningo application
    /// </summary>
    /// <remarks>
    /// This controller handles all challenge-related functionality including:
    /// - Retrieving daily challenge questions
    /// - Creating new challenge questions
    /// - Managing challenge responses and scoring
    /// 
    /// All dates are handled in UTC timezone.
    /// </remarks>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Challenge management endpoints")]
    public class ChallengeController : BaseApiController
    {
        private readonly IChallengeService _challengeService;
        private readonly ILogger<ChallengeController> _logger;
        private readonly IUserProfileService _userProfileService;

        public ChallengeController(
            IChallengeService challengeService,
            ILogger<ChallengeController> logger,
            IUserProfileService userProfileService)
        {
            _challengeService = challengeService ?? throw new ArgumentNullException(nameof(challengeService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _userProfileService = userProfileService ?? throw new ArgumentNullException(nameof(userProfileService));
        }

        [HttpGet("daily")]
        [ProducesResponseType(typeof(List<ChallengeQuestionResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(
            Summary = "Gets daily challenge questions",
            Description = "Retrieves or generates the daily challenge questions for today",
            OperationId = "GetDailyChallengeQuestions",
            Tags = new[] { "Challenge" }
        )]
        [SwaggerResponse(StatusCodes.Status200OK, "The daily challenge questions were retrieved successfully", typeof(List<ChallengeQuestionResponse>))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the challenge questions")]
        public async Task<ActionResult<List<ChallengeQuestionResponse>>> GetDailyChallengeQuestions()
        {
            try
            {
                var questions = await _challengeService.GetDailyChallengeQuestionsAsync();
                return Ok(questions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily challenge questions");
                return StatusCode(500, "An error occurred while retrieving daily challenge questions");
            }
        }

        [HttpGet("review")]
        [ProducesResponseType(typeof(List<ChallengeQuestionResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(
            Summary = "Gets review challenge questions for premium user",
            Description = "Retrieves or generates challenge questions based on flashcards the user has seen. For premium users only. Can optionally filter by category.",
            OperationId = "GetReviewChallengeQuestions",
            Tags = new[] { "Challenge", "Premium" }
        )]
        public async Task<ActionResult<List<ChallengeQuestionResponse>>> GetReviewChallengeQuestions(
            [FromQuery] GetReviewChallengeQuestionsRequest request)
        {
            var authenticatedUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var effectiveUserId = request.UserId ?? authenticatedUserId;

            if (string.IsNullOrEmpty(effectiveUserId))
            {
                return Unauthorized("User ID could not be determined.");
            }

            // Set the effective user ID in the request for the service
            request.UserId = effectiveUserId;

            try
            {
                var userProfile = await _userProfileService.GetUserProfileAsync(effectiveUserId);
                if (userProfile == null)
                {
                    return NotFound("User profile not found.");
                }

                if (!userProfile.IsPremium)
                {
                    return Forbid("This feature is available for premium users only.");
                }

                var questions = await _challengeService.GetChallengeQuestionsForSeenFlashcardsAsync(request);
                if (questions == null || !questions.Any())
                {
                    return Ok(new List<ChallengeQuestionResponse>());
                }
                return Ok(questions.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving review challenge questions");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving review challenge questions.");
            }
        }

        [HttpGet("next-challenge-time")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        [ProducesResponseType(typeof(NextChallengeTimeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(
            Summary = "Gets the time when the next daily challenge becomes available",
            Description = "Returns timing information for when the next daily challenge will reset (00:00 UTC)",
            OperationId = "GetNextChallengeTime",
            Tags = new[] { "Challenge" }
        )]
        public ActionResult<NextChallengeTimeResponse> GetNextChallengeTime()
        {
            try
            {
                var currentTimeUtc = DateTime.UtcNow;
                var nextChallengeTimeUtc = currentTimeUtc.Date.AddDays(1); // Tomorrow at 00:00 UTC
                var timeDiff = nextChallengeTimeUtc - currentTimeUtc;
                var secondsUntilNext = (long)timeDiff.TotalSeconds;

                var response = new NextChallengeTimeResponse
                {
                    CurrentTimeUtc = currentTimeUtc,
                    NextChallengeTimeUtc = nextChallengeTimeUtc,
                    SecondsUntilNext = Math.Max(0, secondsUntilNext),
                    IsNewChallengeAvailable = secondsUntilNext <= 0
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving next challenge time");
                return StatusCode(500, "An error occurred while retrieving next challenge time");
            }
        }
    }
}
