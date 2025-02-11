using System;
using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.Word;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages word-related operations including word forms, lemmas, and translations.
    /// </summary>
    /// <remarks>
    /// This controller handles:
    /// - Word form lookups and grammatical attributes
    /// - Lemma information and definitions
    /// - Word translations and examples
    /// </remarks>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Word management endpoints")]
    public class WordController : BaseApiController
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
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        /// <summary>
        /// Retrieves word forms and grammatical attributes for a given word.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Word/{word}
        /// 
        /// Returns:
        /// - Word forms (conjugations, declensions)
        /// - Grammatical attributes (gender, number, case, etc.)
        /// - Part of speech information
        /// </remarks>
        /// <param name="word">The word to look up</param>
        /// <returns>Word form information including grammatical attributes</returns>
        /// <response code="200">Returns the word form information</response>
        /// <response code="400">If the word parameter is empty or invalid</response>
        /// <response code="404">If the word form is not found</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("{word}")]
        [SwaggerOperation(
            Summary = "Retrieves word forms",
            Description = "Gets word forms and grammatical attributes for a given word",
            OperationId = "GetWordForms",
            Tags = new[] { "Word" }
        )]
        [ProducesResponseType(typeof(WordFormResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
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
        /// Retrieves lemma information and definitions for a given word.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Word/lemma/{lemma}
        /// 
        /// Returns:
        /// - Base form (lemma)
        /// - Definitions and translations
        /// - Usage examples
        /// - Related words
        /// </remarks>
        /// <param name="lemma">The lemma to look up</param>
        /// <returns>Lemma information including definitions and examples</returns>
        /// <response code="200">Returns the lemma information</response>
        /// <response code="400">If the lemma parameter is empty or invalid</response>
        /// <response code="404">If the lemma is not found</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("lemma/{lemma}")]
        [SwaggerOperation(
            Summary = "Retrieves lemma information",
            Description = "Gets lemma information and definitions for a given word",
            OperationId = "GetLemma",
            Tags = new[] { "Word" }
        )]
        [ProducesResponseType(typeof(LemmaResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
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