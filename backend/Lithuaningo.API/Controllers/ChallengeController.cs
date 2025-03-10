using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.Challenge;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.Linq;

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

        /// <summary>
        /// Retrieves the daily challenge questions for the current date
        /// </summary>
        /// <remarks>
        /// Sample request:
        /// 
        ///     GET /api/v1/Challenge/daily
        /// 
        /// The response includes:
        /// - Question text in both Lithuanian and English
        /// - Multiple choice options
        /// - Correct answer indicator
        /// - Question difficulty level
        /// 
        /// Questions are automatically generated if none exist for the current date.
        /// </remarks>
        /// <returns>A collection of challenge questions for the current day</returns>
        /// <response code="200">Returns the list of daily challenge questions</response>
        /// <response code="500">If there was an internal error while retrieving the questions</response>
        [HttpGet("daily")]
        [SwaggerOperation(
            Summary = "Retrieves daily challenge questions",
            Description = "Gets or generates the challenge questions for the current date",
            OperationId = "GetDailyChallenge",
            Tags = new[] { "Challenge" }
        )]
        [ProducesResponseType(typeof(IEnumerable<ChallengeQuestionResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<ChallengeQuestionResponse>>> GetDailyChallenge()
        {
            try
            {
                var questions = await _challengeService.GetDailyChallengeQuestionsAsync();
                return Ok(questions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily challenge questions.");
                return StatusCode(500, "An error occurred while retrieving the daily challenge questions.");
            }
        }

        /// <summary>
        /// Generates challenge questions for a specific deck
        /// </summary>
        /// <remarks>
        /// This endpoint generates challenge questions based on the flashcards in a specific deck.
        /// It uses AI to create questions that test the user's knowledge of the vocabulary and grammar
        /// in the specified deck.
        /// </remarks>
        /// <param name="deckId">ID of the deck to generate questions for</param>
        /// <returns>The generated challenge questions</returns>
        /// <response code="200">Returns the generated challenge questions</response>
        /// <response code="400">If the deck ID is invalid</response>
        /// <response code="404">If the deck has no flashcards</response>
        /// <response code="500">If there was an internal error while generating the questions</response>
        [HttpPost("deck/{deckId}")]
        [SwaggerOperation(
            Summary = "Generates challenge questions for a specific deck",
            Description = "Creates challenge questions based on the flashcards in the specified deck",
            OperationId = "GenerateDeckChallenge",
            Tags = new[] { "Challenge" }
        )]
        [ProducesResponseType(typeof(IEnumerable<ChallengeQuestionResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<ChallengeQuestionResponse>>> GenerateDeckChallenge(string deckId)
        {
            if (string.IsNullOrEmpty(deckId))
            {
                _logger.LogWarning("Invalid deck ID provided");
                return BadRequest("A valid deck ID must be provided");
            }
            
            try
            {
                var questions = await _challengeService.GenerateDeckChallengeQuestionsAsync(deckId);
                
                if (!questions.Any())
                {
                    return NotFound("No flashcards found in the specified deck to generate questions");
                }
                
                return Ok(questions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating challenge questions for deck {DeckId}", deckId);
                return StatusCode(500, "An error occurred while generating challenge questions for the deck");
            }
        }

        /// <summary>
        /// Generates new challenge questions using AI.
        /// </summary>
        /// <remarks>
        /// This endpoint triggers the AI to generate new challenge questions. 
        /// It will replace any existing questions for the current date.
        /// </remarks>
        /// <returns>The generated challenge questions</returns>
        /// <response code="200">Returns the generated challenge questions</response>
        /// <response code="500">If there was an internal error while generating the questions</response>
        [HttpPost("generate")]
        [SwaggerOperation(
            Summary = "Generates challenge questions using AI",
            Description = "Generates new challenge questions using AI for the current date",
            OperationId = "GenerateAIChallenge",
            Tags = new[] { "Challenge" }
        )]
        [ProducesResponseType(typeof(IEnumerable<ChallengeQuestionResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<ChallengeQuestionResponse>>> GenerateAIChallenge()
        {
            try
            {
                var questions = await _challengeService.GenerateAIChallengeQuestionsAsync();
                return Ok(questions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI challenge questions.");
                return StatusCode(500, "An error occurred while generating AI challenge questions.");
            }
        }
    }
}
