using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class SentenceController : ControllerBase
{
    private readonly ISentenceService _sentenceService;

    public SentenceController(ISentenceService sentenceService)
    {
        _sentenceService = sentenceService ?? throw new ArgumentNullException(nameof(sentenceService));
    }

    [HttpGet]
    public async Task<List<Sentence>> GetSentences(List<string> sentenceIds)
    {
        return await _sentenceService.GetSentencesByIdsAsync(sentenceIds);
    }
}