using System;
using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.Word;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using AutoMapper;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Controller for managing words and translations
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class WordController : ControllerBase
    {
        private readonly IWordService _wordService;
        private readonly ILogger<WordController> _logger;
        private readonly IMapper _mapper;

        public WordController(
            IWordService wordService,
            ILogger<WordController> logger,
            IMapper mapper)
        {
            _wordService = wordService ?? throw new ArgumentNullException(nameof(wordService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper;
        }

        /// <summary>
        /// Gets the word forms for a given word
        /// </summary>
        /// <param name="word">The word to look up</param>
        /// <returns>Word form information including grammatical attributes</returns>
        [HttpGet("{word}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<WordFormResponse>> GetWordForms(string word)
        {
            if (string.IsNullOrWhiteSpace(word))
            {
                _logger.LogWarning("Word parameter is empty");
                return BadRequest("Word cannot be empty");
            }

            try
            {
                var result = await _wordService.GetWordForm(word);
                if (result is null)
                {
                    _logger.LogInformation("Word form not found for word {Word}", word);
                    return NotFound();
                }

                var response = _mapper.Map<WordFormResponse>(result);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for word {Word}", word);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving word form for word {Word}", word);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets the lemma information for a given word
        /// </summary>
        /// <param name="lemma">The lemma to look up</param>
        /// <returns>Lemma information including definitions and examples</returns>
        [HttpGet("lemma/{lemma}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<LemmaResponse>> GetLemma(string lemma)
        {
            if (string.IsNullOrWhiteSpace(lemma))
            {
                _logger.LogWarning("Lemma parameter is empty");
                return BadRequest("Lemma cannot be empty");
            }

            try
            {
                var result = await _wordService.GetLemma(lemma);
                if (result is null)
                {
                    _logger.LogInformation("Lemma not found for word {Lemma}", lemma);
                    return NotFound();
                }

                var response = _mapper.Map<LemmaResponse>(result);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for lemma {Lemma}", lemma);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving lemma for word {Lemma}", lemma);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}