using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lithuaningo.API.Authorization;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
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

        public ChallengeController(
            IChallengeService challengeService,
            ILogger<ChallengeController> logger)
        {
            _challengeService = challengeService ?? throw new ArgumentNullException(nameof(challengeService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
    }
}
