using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.Announcement;
using AutoMapper;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Controller for managing announcements
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class AnnouncementController : ControllerBase
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
        /// Gets all announcements
        /// </summary>
        /// <returns>List of announcements</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Gets a specific announcement by ID
        /// </summary>
        /// <param name="id">The announcement identifier</param>
        /// <returns>The requested announcement</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Creates a new announcement
        /// </summary>
        /// <param name="request">The announcement creation request</param>
        /// <returns>The created announcement</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Updates an existing announcement
        /// </summary>
        /// <param name="id">The announcement identifier</param>
        /// <param name="request">The announcement update request</param>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Deletes an announcement
        /// </summary>
        /// <param name="id">The announcement identifier</param>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
