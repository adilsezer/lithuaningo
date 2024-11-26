using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class WordController : ControllerBase
{
    private readonly WordService _wordService;

    public WordController(WordService wordService)
    {
        _wordService = wordService;
    }

    [HttpGet]
    public async Task<IActionResult> GetWords()
    {
        var words = await _wordService.FetchWordsAsync();
        return Ok(words);
    }

    [HttpPost("review")]
    public async Task<IActionResult> AddWordForReview([FromBody] Word word)
    {
        await _wordService.AddWordForReviewAsync(word);
        return NoContent();
    }

    [HttpPost("missing")]
    public async Task<IActionResult> AddMissingWord([FromBody] string word)
    {
        await _wordService.AddMissingWordAsync(word);
        return NoContent();
    }
}