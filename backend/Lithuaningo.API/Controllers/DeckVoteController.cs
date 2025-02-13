using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.DeckVote;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages deck voting operations including creating and retrieving votes.
    /// </summary>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Deck vote management endpoints")]
    public class DeckVoteController : BaseApiController
    {
        private readonly IDeckVoteService _voteService;
        private readonly ILogger<DeckVoteController> _logger;

        public DeckVoteController(
            IDeckVoteService voteService,
            ILogger<DeckVoteController> logger)
        {
            _voteService = voteService ?? throw new ArgumentNullException(nameof(voteService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Creates or updates a vote for a deck.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/DeckVote
        ///     {
        ///         "deckId": "deck-guid",
        ///         "userId": "user-guid",
        ///         "isUpvote": true
        ///     }
        /// </remarks>
        /// <param name="request">The vote creation request</param>
        /// <returns>The created vote</returns>
        /// <response code="200">Vote successfully recorded</response>
        /// <response code="400">Invalid request data</response>
        /// <response code="500">Error during vote creation</response>
        [HttpPost]
        [SwaggerOperation(
            Summary = "Creates or updates a vote",
            Description = "Creates a new vote or updates an existing one for a deck",
            OperationId = "CreateDeckVote",
            Tags = new[] { "DeckVote" }
        )]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<bool>> CreateVote([FromBody] CreateDeckVoteRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _voteService.VoteDeckAsync(request.DeckId, request.UserId, request.IsUpvote);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating vote");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets a user's vote for a specific deck.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/DeckVote/{deckId}/user/{userId}
        /// </remarks>
        /// <param name="deckId">The deck identifier</param>
        /// <param name="userId">The user identifier</param>
        /// <returns>The user's vote for the deck</returns>
        /// <response code="200">Returns the user's vote</response>
        /// <response code="404">Vote not found</response>
        /// <response code="500">Error during retrieval</response>
        [HttpGet("{deckId}/user/{userId}")]
        [SwaggerOperation(
            Summary = "Gets a user's vote",
            Description = "Retrieves a user's vote for a specific deck",
            OperationId = "GetUserVote",
            Tags = new[] { "DeckVote" }
        )]
        [ProducesResponseType(typeof(DeckVoteResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DeckVoteResponse>> GetUserVote(Guid deckId, Guid userId)
        {
            try
            {
                var vote = await _voteService.GetUserVoteAsync(deckId, userId);
                if (vote == null)
                {
                    return NotFound();
                }

                return Ok(vote);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vote");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets vote counts for a deck.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/DeckVote/{deckId}/counts
        /// </remarks>
        /// <param name="deckId">The deck identifier</param>
        /// <returns>The upvote and downvote counts</returns>
        /// <response code="200">Returns the vote counts</response>
        /// <response code="500">Error during retrieval</response>
        [HttpGet("{deckId}/counts")]
        [SwaggerOperation(
            Summary = "Gets vote counts",
            Description = "Retrieves the total upvotes and downvotes for a deck",
            OperationId = "GetVoteCounts",
            Tags = new[] { "DeckVote" }
        )]
        [ProducesResponseType(typeof((int upvotes, int downvotes)), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<(int upvotes, int downvotes)>> GetVoteCounts(Guid deckId)
        {
            try
            {
                var counts = await _voteService.GetDeckVoteCountsAsync(deckId);
                return Ok(counts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vote counts");
                return StatusCode(500, "Internal server error");
            }
        }
    }
} 