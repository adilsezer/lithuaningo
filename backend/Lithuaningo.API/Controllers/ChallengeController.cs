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
            Description = "Retrieves or generates challenge questions based on flashcards the user has seen. For premium users only.",
            OperationId = "GetReviewChallengeQuestions",
            Tags = new[] { "Challenge", "Premium" }
        )]
        public async Task<ActionResult<List<ChallengeQuestionResponse>>> GetReviewChallengeQuestions([FromQuery] string? userId = null, [FromQuery] int count = 10)
        {
            var authenticatedUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var effectiveUserId = userId ?? authenticatedUserId;

            if (string.IsNullOrEmpty(effectiveUserId))
            {
                _logger.LogWarning("Effective User ID could not be determined for review challenge.");
                return Unauthorized("User ID could not be determined.");
            }

            try
            {
                var userProfile = await _userProfileService.GetUserProfileAsync(effectiveUserId);
                if (userProfile == null)
                {
                    _logger.LogWarning("User profile not found for user for review challenge.");
                    return NotFound("User profile not found.");
                }

                if (!userProfile.IsPremium)
                {
                    _logger.LogInformation("User attempted to access review challenge without premium status.");
                    return Forbid("This feature is available for premium users only.");
                }

                _logger.LogInformation("Fetching review challenge questions for user (Premium).");
                var questions = await _challengeService.GenerateReviewChallengeQuestionsAsync(effectiveUserId, count);
                if (questions == null || !questions.Any())
                {
                    _logger.LogInformation("No review questions generated or found.");
                    // Return empty list with 200 OK if no questions, or could be 204 No Content
                    return Ok(new List<ChallengeQuestionResponse>());
                }
                return Ok(questions.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving review challenge questions for user {EffectiveUserId}.", effectiveUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving review challenge questions.");
            }
        }
    }
}
