using Microsoft.AspNetCore.Mvc;
using Services.Quiz.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private readonly IQuizService _quizService;

    public QuizController(IQuizService quizService)
    {
        _quizService = quizService ?? throw new ArgumentNullException(nameof(quizService));
    }

    /// <summary>
    /// Generates a new quiz based on the user's learned words.
    /// </summary>
    /// <param name="userId">The ID of the user.</param>
    /// <returns>A set of quiz questions.</returns>
    [HttpGet("generate")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<QuizQuestion>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<QuizQuestion>>> GenerateQuiz([FromQuery] string userId)
    {
        if (string.IsNullOrEmpty(userId))
            return BadRequest("UserId is required.");

        try
        {
            var quizData = await _quizService.GenerateQuizAsync(userId);
            return Ok(quizData);
        }
        catch (Exception ex)
        {
            // Log the exception (implementation depends on your logging setup)
            Console.Error.WriteLine(ex.Message);
            return StatusCode(500, "An error occurred while generating the quiz.");
        }
    }
}
