using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
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
        public async Task<ActionResult<string>> CreateComment([FromBody] Comment comment, [FromQuery] string userId)
        {
            comment.CreatedBy = userId;
            var commentId = await _commentService.CreateCommentAsync(comment);
            return Ok(commentId);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateComment(string id, [FromBody] Comment comment, [FromQuery] string userId)
        {
            var existingComment = await _commentService.GetCommentByIdAsync(id);
            if (existingComment == null)
                return NotFound();

            comment.Id = id;
            comment.CreatedBy = userId;
            comment.IsEdited = true;
            await _commentService.UpdateCommentAsync(id, comment);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteComment(string id, [FromQuery] string userId)
        {
            var existingComment = await _commentService.GetCommentByIdAsync(id);
            if (existingComment == null)
                return NotFound();

            await _commentService.DeleteCommentAsync(id);
            return Ok();
        }

        [HttpPost("{id}/like")]
        public async Task<ActionResult> LikeComment(string id, [FromQuery] string userId)
        {
            var success = await _commentService.LikeCommentAsync(id, userId);
            if (!success)
                return NotFound();

            return Ok();
        }

        [HttpPost("{id}/unlike")]
        public async Task<ActionResult> UnlikeComment(string id, [FromQuery] string userId)
        {
            var success = await _commentService.UnlikeCommentAsync(id, userId);
            if (!success)
                return NotFound();

            return Ok();
        }
    }
} 