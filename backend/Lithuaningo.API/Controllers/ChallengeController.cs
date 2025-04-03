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

        [HttpPost("generate")]
        [ProducesResponseType(typeof(List<ChallengeQuestionResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(
            Summary = "Generates challenge questions",
            Description = "Generates challenge questions using AI",
            OperationId = "GenerateChallengeQuestions",
            Tags = new[] { "Challenge" }
        )]
        [SwaggerResponse(StatusCodes.Status200OK, "The challenge questions were generated successfully", typeof(List<ChallengeQuestionResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "The request parameters are invalid")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "An error occurred while generating the challenge questions")]
        public async Task<ActionResult<List<ChallengeQuestionResponse>>> GenerateChallengeQuestions()
        {
            try
            {
                var questions = await _challengeService.GenerateAIChallengeQuestionsAsync();
                return Ok(questions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating challenge questions");
                return StatusCode(500, "An error occurred while generating challenge questions");
            }
        }
    }
}
