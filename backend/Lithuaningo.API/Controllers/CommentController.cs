using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lithuaningo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpGet("deck/{deckId}")]
        public async Task<ActionResult<List<Comment>>> GetDeckComments(string deckId)
        {
            var comments = await _commentService.GetDeckCommentsAsync(deckId);
            return Ok(comments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Comment>> GetComment(string id)
        {
            var comment = await _commentService.GetCommentByIdAsync(id);
            if (comment == null)
                return NotFound();

            return Ok(comment);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<string>> CreateComment([FromBody] Comment comment)
        {
            var userId = User.Identity?.Name;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            comment.CreatedBy = userId;
            var commentId = await _commentService.CreateCommentAsync(comment);
            return Ok(commentId);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult> UpdateComment(string id, [FromBody] Comment comment)
        {
            var userId = User.Identity?.Name;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var existingComment = await _commentService.GetCommentByIdAsync(id);
            if (existingComment == null)
                return NotFound();

            if (existingComment.CreatedBy != userId)
                return Forbid();

            comment.Id = id;
            comment.CreatedBy = userId;
            comment.IsEdited = true;
            await _commentService.UpdateCommentAsync(id, comment);
            return Ok();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteComment(string id)
        {
            var userId = User.Identity?.Name;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var existingComment = await _commentService.GetCommentByIdAsync(id);
            if (existingComment == null)
                return NotFound();

            if (existingComment.CreatedBy != userId)
                return Forbid();

            await _commentService.DeleteCommentAsync(id);
            return Ok();
        }

        [HttpPost("{id}/like")]
        [Authorize]
        public async Task<ActionResult> LikeComment(string id)
        {
            var userId = User.Identity?.Name;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var success = await _commentService.LikeCommentAsync(id, userId);
            if (!success)
                return NotFound();

            return Ok();
        }

        [HttpPost("{id}/unlike")]
        [Authorize]
        public async Task<ActionResult> UnlikeComment(string id)
        {
            var userId = User.Identity?.Name;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var success = await _commentService.UnlikeCommentAsync(id, userId);
            if (!success)
                return NotFound();

            return Ok();
        }
    }
} 