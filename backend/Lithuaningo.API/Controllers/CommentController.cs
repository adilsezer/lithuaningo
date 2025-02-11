using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.Comment;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages comments for decks. This controller allows fetching comments by deck or user,
    /// creating, retrieving, updating, and deleting individual comments.
    /// </summary>
    /// <remarks>
    /// This controller handles all comment-related functionality including:
    /// - Retrieving comments for specific decks
    /// - Managing user comments
    /// - Creating and updating comments
    /// - Deleting comments
    /// - Fetching user-specific comment history
    /// 
    /// All operations support proper error handling and validation.
    /// </remarks>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Comment management endpoints")]
    public class CommentController : BaseApiController
    {
        private readonly ICommentService _commentService;
        private readonly ILogger<CommentController> _logger;
        private readonly IMapper _mapper;

        public CommentController(
            ICommentService commentService,
            ILogger<CommentController> logger,
            IMapper mapper)
        {
            _commentService = commentService ?? throw new ArgumentNullException(nameof(commentService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        /// <summary>
        /// Retrieves all comments associated with a specific deck.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Comment/deck/{deckId}
        /// 
        /// The response includes:
        /// - Comment content
        /// - Author information
        /// - Creation timestamp
        /// - Last update timestamp (if edited)
        /// - Any associated metadata
        /// </remarks>
        /// <param name="deckId">The deck identifier</param>
        /// <returns>List of comments for the deck</returns>
        /// <response code="200">Returns a list of comments</response>
        /// <response code="400">If deck ID is empty</response>
        /// <response code="500">If there was an internal error while retrieving comments</response>
        [HttpGet("deck/{deckId}")]
        [SwaggerOperation(
            Summary = "Retrieves deck comments",
            Description = "Gets all comments associated with the specified deck",
            OperationId = "GetDeckComments",
            Tags = new[] { "Comment" }
        )]
        [ProducesResponseType(typeof(List<CommentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<CommentResponse>>> GetDeckComments(string deckId)
        {
            if (string.IsNullOrWhiteSpace(deckId))
            {
                _logger.LogWarning("Deck ID is empty");
                return BadRequest("Deck ID cannot be empty");
            }

            try
            {
                var comments = await _commentService.GetDeckCommentsAsync(deckId);
                var response = _mapper.Map<List<CommentResponse>>(comments);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comments for deck {DeckId}", deckId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Creates a new comment.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/Comment
        ///     {
        ///         "deckId": "deck-guid",
        ///         "userId": "user-guid",
        ///         "content": "This deck is very helpful for beginners!",
        ///         "rating": 5,
        ///         "tags": ["helpful", "beginner-friendly"]
        ///     }
        /// 
        /// The request must include:
        /// - Deck ID (required)
        /// - User ID (required)
        /// - Comment content (required)
        /// - Optional rating
        /// - Optional tags
        /// </remarks>
        /// <param name="request">The comment creation request</param>
        /// <returns>The created comment</returns>
        /// <response code="201">Returns the created comment</response>
        /// <response code="400">If the request model is invalid</response>
        /// <response code="500">If there was an internal error during creation</response>
        [HttpPost]
        [SwaggerOperation(
            Summary = "Creates a new comment",
            Description = "Creates a new comment for a deck",
            OperationId = "CreateComment",
            Tags = new[] { "Comment" }
        )]
        [ProducesResponseType(typeof(CommentResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CommentResponse>> CreateComment([FromBody] CreateCommentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var comment = _mapper.Map<Comment>(request);
                var createdComment = await _commentService.CreateCommentAsync(comment);
                var response = _mapper.Map<CommentResponse>(createdComment);
                return CreatedAtAction(nameof(GetComment), new { id = createdComment.Id }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating comment");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves a specific comment by its ID.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Comment/{id}
        /// 
        /// The response includes:
        /// - Comment details
        /// - Author information
        /// - Associated deck information
        /// - Creation and update timestamps
        /// </remarks>
        /// <param name="id">The comment identifier</param>
        /// <returns>The requested comment</returns>
        /// <response code="200">Returns the comment</response>
        /// <response code="400">If comment ID is empty</response>
        /// <response code="404">If comment not found</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("{id}")]
        [SwaggerOperation(
            Summary = "Retrieves a specific comment",
            Description = "Gets detailed information about a specific comment",
            OperationId = "GetComment",
            Tags = new[] { "Comment" }
        )]
        [ProducesResponseType(typeof(CommentResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CommentResponse>> GetComment(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Comment ID is empty");
                return BadRequest("Comment ID cannot be empty");
            }

            try
            {
                var comment = await _commentService.GetCommentByIdAsync(id);
                if (comment == null)
                {
                    return NotFound();
                }
                var response = _mapper.Map<CommentResponse>(comment);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comment {CommentId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates an existing comment.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     PUT /api/v1/Comment/{id}
        ///     {
        ///         "content": "Updated: This deck is excellent for beginners!",
        ///         "rating": 5,
        ///         "tags": ["helpful", "beginner-friendly", "updated"]
        ///     }
        /// 
        /// The request must include:
        /// - Updated content (required)
        /// - Optional rating update
        /// - Optional tags update
        /// 
        /// Note: Only the comment author can update their comment.
        /// </remarks>
        /// <param name="id">The comment identifier</param>
        /// <param name="request">The comment update request</param>
        /// <returns>The updated comment</returns>
        /// <response code="200">Returns the updated comment</response>
        /// <response code="400">If comment ID is empty or model state is invalid</response>
        /// <response code="404">If comment not found</response>
        /// <response code="500">If there was an internal error during update</response>
        [HttpPut("{id}")]
        [SwaggerOperation(
            Summary = "Updates an existing comment",
            Description = "Updates a comment with the specified properties",
            OperationId = "UpdateComment",
            Tags = new[] { "Comment" }
        )]
        [ProducesResponseType(typeof(CommentResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CommentResponse>> UpdateComment(string id, [FromBody] UpdateCommentRequest request)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Comment ID is empty");
                return BadRequest("Comment ID cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var comment = _mapper.Map<Comment>(request);
                comment.Id = Guid.Parse(id);
                var updatedComment = await _commentService.UpdateCommentAsync(comment);
                if (updatedComment == null)
                {
                    return NotFound();
                }
                var response = _mapper.Map<CommentResponse>(updatedComment);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating comment {CommentId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deletes a comment.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     DELETE /api/v1/Comment/{id}
        /// 
        /// Permanently removes the comment from the system.
        /// This action cannot be undone.
        /// Only the comment author or an administrator can delete a comment.
        /// </remarks>
        /// <param name="id">The comment identifier</param>
        /// <response code="204">Comment successfully deleted</response>
        /// <response code="400">If comment ID is empty</response>
        /// <response code="500">If there was an internal error during deletion</response>
        [HttpDelete("{id}")]
        [SwaggerOperation(
            Summary = "Deletes a comment",
            Description = "Permanently removes a comment from the system",
            OperationId = "DeleteComment",
            Tags = new[] { "Comment" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteComment(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Comment ID is empty");
                return BadRequest("Comment ID cannot be empty");
            }

            try
            {
                await _commentService.DeleteCommentAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting comment {CommentId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves all comments by a specific user.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Comment/user/{userId}
        /// 
        /// Returns all comments made by the specified user across all decks.
        /// Results are ordered by creation date (newest first).
        /// </remarks>
        /// <param name="userId">The user identifier</param>
        /// <returns>List of comments by the user</returns>
        /// <response code="200">Returns a list of user's comments</response>
        /// <response code="400">If user ID is empty</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("user/{userId}")]
        [SwaggerOperation(
            Summary = "Retrieves user comments",
            Description = "Gets all comments made by the specified user",
            OperationId = "GetUserComments",
            Tags = new[] { "Comment" }
        )]
        [ProducesResponseType(typeof(List<CommentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<CommentResponse>>> GetUserComments(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID is empty");
                return BadRequest("User ID cannot be empty");
            }

            try
            {
                var comments = await _commentService.GetUserCommentsAsync(userId);
                var response = _mapper.Map<List<CommentResponse>>(comments);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comments for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
