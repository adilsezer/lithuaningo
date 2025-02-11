using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.Announcement;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authorization;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages announcement data in the application. Supports retrieving all announcements, retrieving a specific announcement by ID,
    /// creating new announcements, updating an existing announcement, and deleting announcements.
    /// </summary>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Announcement management endpoints")]
    public class AnnouncementController : BaseApiController
    {
        private readonly IAnnouncementService _announcementService;
        private readonly ILogger<AnnouncementController> _logger;
        private readonly IMapper _mapper;

        public AnnouncementController(
            IAnnouncementService announcementService,
            ILogger<AnnouncementController> logger,
            IMapper mapper)
        {
            _announcementService = announcementService ?? throw new ArgumentNullException(nameof(announcementService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        /// <summary>
        /// Retrieves all announcements.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Announcement
        /// </remarks>
        /// <returns>A list of announcements</returns>
        /// <response code="200">Returns a list of announcements</response>
        /// <response code="500">An internal error occurred while retrieving announcements</response>
        [AllowAnonymous]
        [HttpGet]
        [SwaggerOperation(
            Summary = "Retrieves all announcements",
            Description = "Gets a list of all announcements in the system",
            OperationId = "GetAnnouncements",
            Tags = new[] { "Announcement" }
        )]
        [ProducesResponseType(typeof(IEnumerable<AnnouncementResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<AnnouncementResponse>>> GetAnnouncements()
        {
            try
            {
                var announcements = await _announcementService.GetAnnouncementsAsync();
                var response = _mapper.Map<IEnumerable<AnnouncementResponse>>(announcements);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving announcements");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves a specific announcement by its unique identifier.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Announcement/{id}
        /// </remarks>
        /// <param name="id">The unique identifier of the announcement (Must not be empty)</param>
        /// <returns>The requested announcement</returns>
        /// <response code="200">Returns an announcement object</response>
        /// <response code="400">Provided announcement ID is empty</response>
        /// <response code="404">No announcement found with the given ID</response>
        /// <response code="500">An error occurred during retrieval</response>
        [AllowAnonymous]
        [HttpGet("{id}")]
        [SwaggerOperation(
            Summary = "Retrieves a specific announcement",
            Description = "Gets an announcement by its unique identifier",
            OperationId = "GetAnnouncementById",
            Tags = new[] { "Announcement" }
        )]
        [ProducesResponseType(typeof(AnnouncementResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<AnnouncementResponse>> GetAnnouncementById(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Announcement ID is empty");
                return BadRequest("Announcement ID cannot be empty");
            }

            try
            {
                var announcement = await _announcementService.GetAnnouncementByIdAsync(id);
                if (announcement == null)
                {
                    return NotFound();
                }
                var response = _mapper.Map<AnnouncementResponse>(announcement);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving announcement with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Creates a new announcement.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/Announcement
        ///     {
        ///         "title": "New Feature Release",
        ///         "content": "Check out our latest features!",
        ///         "startDate": "2024-03-15T00:00:00Z",
        ///         "endDate": "2024-03-22T00:00:00Z"
        ///     }
        /// </remarks>
        /// <param name="request">The announcement creation request</param>
        /// <returns>The created announcement</returns>
        /// <response code="201">Returns the created announcement</response>
        /// <response code="400">Invalid request model</response>
        /// <response code="500">An error occurred during the creation of the announcement</response>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        [SwaggerOperation(
            Summary = "Creates a new announcement",
            Description = "Creates a new announcement in the system",
            OperationId = "CreateAnnouncement",
            Tags = new[] { "Announcement" }
        )]
        [ProducesResponseType(typeof(AnnouncementResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<AnnouncementResponse>> CreateAnnouncement([FromBody] CreateAnnouncementRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var announcement = _mapper.Map<Announcement>(request);
                await _announcementService.CreateAnnouncementAsync(announcement);
                var response = _mapper.Map<AnnouncementResponse>(announcement);
                return CreatedAtAction(nameof(GetAnnouncementById), new { id = announcement.Id }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating announcement");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates an existing announcement identified by its ID.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     PUT /api/v1/Announcement/{id}
        ///     {
        ///         "title": "Updated Feature Release",
        ///         "content": "Updated content for our latest features!",
        ///         "startDate": "2024-03-15T00:00:00Z",
        ///         "endDate": "2024-03-22T00:00:00Z"
        ///     }
        /// </remarks>
        /// <param name="id">The announcement identifier</param>
        /// <param name="request">The announcement update request</param>
        /// <response code="204">Announcement successfully updated</response>
        /// <response code="400">Either the announcement ID is empty or ModelState is invalid</response>
        /// <response code="404">No announcement found with the given ID</response>
        /// <response code="500">An error occurred during the update</response>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        [SwaggerOperation(
            Summary = "Updates an existing announcement",
            Description = "Updates an announcement identified by its ID",
            OperationId = "UpdateAnnouncement",
            Tags = new[] { "Announcement" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateAnnouncement(string id, [FromBody] UpdateAnnouncementRequest request)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Announcement ID is empty");
                return BadRequest("Announcement ID cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var announcement = _mapper.Map<Announcement>(request);
                announcement.Id = Guid.Parse(id);
                
                await _announcementService.UpdateAnnouncementAsync(id, announcement);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Bad request when updating announcement with ID: {Id}", id);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating announcement with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deletes an announcement based on its ID.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     DELETE /api/v1/Announcement/{id}
        /// </remarks>
        /// <param name="id">The announcement identifier</param>
        /// <response code="204">Announcement successfully deleted</response>
        /// <response code="400">Announcement ID is empty</response>
        /// <response code="500">An error occurred during deletion</response>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        [SwaggerOperation(
            Summary = "Deletes an announcement",
            Description = "Deletes an announcement based on its ID",
            OperationId = "DeleteAnnouncement",
            Tags = new[] { "Announcement" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteAnnouncement(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Announcement ID is empty");
                return BadRequest("Announcement ID cannot be empty");
            }

            try
            {
                await _announcementService.DeleteAnnouncementAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Bad request when deleting announcement with ID: {Id}", id);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting announcement with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
