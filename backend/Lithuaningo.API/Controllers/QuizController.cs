using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.Quiz;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;

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
        /// Creates new daily quiz questions for the current date
        /// </summary>
        /// <remarks>
        /// Sample request:
        /// 
        ///     POST /api/v1/Quiz/daily
        ///     [
        ///       {
        ///         "questionText": "Kaip sekasi?",
        ///         "englishTranslation": "How are you?",
        ///         "options": ["Gerai", "Blogai", "Normaliai", "Puikiai"],
        ///         "correctAnswerIndex": 0,
        ///         "difficulty": "Beginner"
        ///       }
        ///     ]
        /// 
        /// Notes:
        /// - Questions are set for the current UTC date
        /// - Existing questions for the date will be replaced
        /// - All questions are set as multiple choice type
        /// </remarks>
        /// <param name="requests">The list of quiz questions to create</param>
        /// <returns>The created quiz questions with their assigned IDs</returns>
        /// <response code="200">Returns the created quiz questions</response>
        /// <response code="400">If the request model is invalid</response>
        /// <response code="501">If the quiz creation feature is not implemented</response>
        /// <response code="500">If there was an internal error while creating the questions</response>
        [HttpPost("daily")]
        [SwaggerOperation(
            Summary = "Creates daily quiz questions",
            Description = "Creates new quiz questions for the current date",
            OperationId = "CreateDailyQuiz",
            Tags = new[] { "Quiz" }
        )]
        [ProducesResponseType(typeof(IEnumerable<QuizQuestionResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status501NotImplemented)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<QuizQuestionResponse>>> CreateDailyQuiz([FromBody] List<CreateQuizQuestionRequest> requests)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var questions = await _quizService.CreateDailyQuizQuestionsAsync(requests);
                return Ok(questions);
            }
            catch (NotImplementedException nie)
            {
                _logger.LogWarning(nie, "Quiz creation not implemented.");
                return StatusCode(501, "Quiz creation functionality is not implemented yet.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating daily quiz questions.");
                return StatusCode(500, "An error occurred while creating the daily quiz questions.");
            }
        }
    }
}
