using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lithuaningo.API.Controllers
{
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
    }
}