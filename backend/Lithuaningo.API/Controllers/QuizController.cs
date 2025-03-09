using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.Quiz;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages quiz-related operations in the Lithuaningo application
    /// </summary>
    /// <remarks>
    /// This controller handles all quiz-related functionality including:
    /// - Retrieving daily quiz questions
    /// - Creating new quiz questions
    /// - Managing quiz responses and scoring
    /// 
    /// All dates are handled in UTC timezone.
    /// </remarks>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Quiz management endpoints")]
    public class QuizController : BaseApiController
    {
        private readonly IQuizService _quizService;
        private readonly ILogger<QuizController> _logger;

        public QuizController(
            IQuizService quizService,
            ILogger<QuizController> logger)
        {
            _quizService = quizService ?? throw new ArgumentNullException(nameof(quizService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves the daily quiz questions for the current date
        /// </summary>
        /// <remarks>
        /// Sample request:
        /// 
        ///     GET /api/v1/Quiz/daily
        /// 
        /// The response includes:
        /// - Question text in both Lithuanian and English
        /// - Multiple choice options
        /// - Correct answer indicator
        /// - Question difficulty level
        /// 
        /// Questions are automatically generated if none exist for the current date.
        /// </remarks>
        /// <returns>A collection of quiz questions for the current day</returns>
        /// <response code="200">Returns the list of daily quiz questions</response>
        /// <response code="500">If there was an internal error while retrieving the questions</response>
        [HttpGet("daily")]
        [SwaggerOperation(
            Summary = "Retrieves daily quiz questions",
            Description = "Gets or generates the quiz questions for the current date",
            OperationId = "GetDailyQuiz",
            Tags = new[] { "Quiz" }
        )]
        [ProducesResponseType(typeof(IEnumerable<QuizQuestionResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<QuizQuestionResponse>>> GetDailyQuiz()
        {
            try
            {
                var questions = await _quizService.GetDailyQuizQuestionsAsync();
                return Ok(questions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily quiz questions.");
                return StatusCode(500, "An error occurred while retrieving the daily quiz questions.");
            }
        }

        /// <summary>
        /// Generates new quiz questions using AI.
        /// </summary>
        /// <remarks>
        /// This endpoint triggers the AI to generate new quiz questions. 
        /// It will replace any existing questions for the current date.
        /// </remarks>
        /// <returns>The generated quiz questions</returns>
        /// <response code="200">Returns the generated quiz questions</response>
        /// <response code="500">If there was an internal error while generating the questions</response>
        [HttpPost("generate")]
        [SwaggerOperation(
            Summary = "Generates quiz questions using AI",
            Description = "Generates new quiz questions using AI for the current date",
            OperationId = "GenerateAIQuiz",
            Tags = new[] { "Quiz" }
        )]
        [ProducesResponseType(typeof(IEnumerable<QuizQuestionResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<QuizQuestionResponse>>> GenerateAIQuiz()
        {
            try
            {
                var questions = await _quizService.GenerateAIQuizQuestionsAsync();
                return Ok(questions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI quiz questions.");
                return StatusCode(500, "An error occurred while generating AI quiz questions.");
            }
        }
    }
}
