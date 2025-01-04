using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class WordController : ControllerBase
{
    private readonly IWordService _wordService;

    public WordController(IWordService wordService)
    {
        _wordService = wordService ?? throw new ArgumentNullException(nameof(wordService));
    }

    [HttpGet("{word}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(WordForm))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WordForm>> GetWordForms(string word)
    {
        var result = await _wordService.GetWordForm(word);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpGet("lemma/{lemma}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(WordForm))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WordForm>> GetLemma(string lemma)
    {
        var result = await _wordService.GetLemma(lemma);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpGet("random")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<WordOfTheDay>))]
    public async Task<ActionResult<List<WordOfTheDay>>> GetRandomWordsOfTheDay([FromQuery] int count = 5)
    {
        var result = await _wordService.GetRandomWordsOfTheDay(count);
        return Ok(result);
    }
}