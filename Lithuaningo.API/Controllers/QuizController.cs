using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private readonly QuizService _quizService;

    public QuizController(QuizService quizService)
    {
        _quizService = quizService;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> LoadQuizData(string userId)
    {
        var quizData = await _quizService.LoadQuizDataAsync(userId);
        return Ok(quizData);
    }
}
