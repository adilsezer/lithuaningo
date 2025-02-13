using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.DTOs.DeckReport;
using Lithuaningo.API.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Handles the creation, retrieval, update, and deletion of deck reports that flag decks
    /// for issues such as inappropriate content.
    /// </summary>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Deck report management endpoints")]
    public class DeckReportController : BaseApiController
    {
        private readonly IDeckReportService _reportService;
        private readonly ILogger<DeckReportController> _logger;

        public DeckReportController(
            IDeckReportService reportService,
            ILogger<DeckReportController> logger)
        {
            _reportService = reportService ?? throw new ArgumentNullException(nameof(reportService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Creates a new deck report.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/DeckReport
        ///     {
        ///         "deckId": "deck-guid",
        ///         "reporterId": "user-guid",
        ///         "reason": "Inappropriate content",
        ///         "details": "Contains offensive language"
        ///     }
        /// </remarks>
        /// <param name="request">The report creation request</param>
        /// <returns>The created deck report</returns>
        /// <response code="201">Returns the created deck report</response>
        /// <response code="400">Invalid request data</response>
        /// <response code="500">Error during report creation</response>
        [HttpPost]
        [SwaggerOperation(
            Summary = "Creates a new deck report",
            Description = "Creates a new report for a deck with inappropriate content",
            OperationId = "CreateDeckReport",
            Tags = new[] { "DeckReport" }
        )]
        [ProducesResponseType(typeof(DeckReportResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DeckReportResponse>> CreateReport([FromBody] CreateDeckReportRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var reportId = await _reportService.CreateReportAsync(request);
                var createdReport = await _reportService.GetReportByIdAsync(reportId);
                return CreatedAtAction(nameof(GetReport), new { id = reportId }, createdReport);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating report");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves deck reports filtered by status.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/DeckReport?status=pending&amp;limit=50
        /// </remarks>
        /// <param name="status">Filter reports by status (default: "pending")</param>
        /// <param name="limit">Maximum number of reports to return (range: 1-100, default: 50)</param>
        /// <returns>List of deck reports</returns>
        /// <response code="200">Returns a list of deck reports</response>
        /// <response code="400">Limit out of range</response>
        /// <response code="500">Error during retrieval</response>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        [SwaggerOperation(
            Summary = "Retrieves deck reports",
            Description = "Gets a list of deck reports filtered by status",
            OperationId = "GetDeckReports",
            Tags = new[] { "DeckReport" }
        )]
        [ProducesResponseType(typeof(List<DeckReportResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<DeckReportResponse>>> GetReports(
            [FromQuery] string status = "pending",
            [FromQuery] int limit = 50)
        {
            if (limit <= 0 || limit > 100)
            {
                _logger.LogWarning("Invalid limit parameter: {Limit}", limit);
                return BadRequest("Limit must be between 1 and 100");
            }

            try
            {
                List<DeckReportResponse> reports = status.ToLower() == "pending"
                    ? await _reportService.GetPendingReportsAsync(limit)
                    : await _reportService.GetReportsByStatusAsync(status);

                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reports with status {Status}", status);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves a single deck report by its ID.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/DeckReport/{id}
        /// </remarks>
        /// <param name="id">The report identifier</param>
        /// <returns>The requested report</returns>
        /// <response code="200">Returns the report details</response>
        /// <response code="400">Report ID is empty</response>
        /// <response code="404">Report not found</response>
        /// <response code="500">Error during retrieval</response>
        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        [SwaggerOperation(
            Summary = "Retrieves a specific report",
            Description = "Gets detailed information about a specific deck report",
            OperationId = "GetDeckReport",
            Tags = new[] { "DeckReport" }
        )]
        [ProducesResponseType(typeof(DeckReportResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DeckReportResponse>> GetReport(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Report ID is empty");
                return BadRequest("Report ID cannot be empty");
            }

            try
            {
                var report = await _reportService.GetReportByIdAsync(id);
                if (report == null)
                {
                    return NotFound();
                }

                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report {ReportId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves all deck reports for a specific deck.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/DeckReport/deck/{deckId}
        /// </remarks>
        /// <param name="deckId">The deck identifier</param>
        /// <returns>List of reports for the deck</returns>
        /// <response code="200">Returns a list of reports for the deck</response>
        /// <response code="400">Deck ID is empty</response>
        /// <response code="500">Error during retrieval</response>
        [Authorize(Roles = "Admin")]
        [HttpGet("deck/{deckId}")]
        [SwaggerOperation(
            Summary = "Retrieves deck reports",
            Description = "Gets all reports associated with a specific deck",
            OperationId = "GetDeckReports",
            Tags = new[] { "DeckReport" }
        )]
        [ProducesResponseType(typeof(List<DeckReportResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<DeckReportResponse>>> GetDeckReports(string deckId)
        {
            if (string.IsNullOrWhiteSpace(deckId))
            {
                _logger.LogWarning("Deck ID is empty");
                return BadRequest("Deck ID cannot be empty");
            }

            try
            {
                var reports = await _reportService.GetDeckReportsAsync(Guid.Parse(deckId));
                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reports for deck {DeckId}", deckId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates the status of a specific deck report.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     PUT /api/v1/DeckReport/{id}/status
        ///     {
        ///         "status": "resolved",
        ///         "reviewedBy": "admin-guid",
        ///         "resolution": "Content removed"
        ///     }
        /// </remarks>
        /// <param name="id">The report identifier</param>
        /// <param name="request">The status update request</param>
        /// <returns>The updated report</returns>
        /// <response code="200">Returns the updated report</response>
        /// <response code="400">Report ID is empty or invalid model state</response>
        /// <response code="404">Report not found</response>
        /// <response code="500">Error during update</response>
        [HttpPut("{id}/status")]
        [SwaggerOperation(
            Summary = "Updates report status",
            Description = "Updates the status of a deck report",
            OperationId = "UpdateReportStatus",
            Tags = new[] { "DeckReport" }
        )]
        [ProducesResponseType(typeof(DeckReportResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DeckReportResponse>> UpdateReportStatus(
            string id,
            [FromBody] UpdateDeckReportRequest request)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Report ID is empty");
                return BadRequest("Report ID cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _reportService.UpdateReportStatusAsync(
                    id,
                    request.Status,
                    request.ReviewerId.ToString(),
                    request.Resolution);

                var updatedReport = await _reportService.GetReportByIdAsync(id);
                if (updatedReport == null)
                {
                    return NotFound();
                }

                return Ok(updatedReport);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating report status for {ReportId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deletes a report based on its ID.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     DELETE /api/v1/DeckReport/{id}
        /// </remarks>
        /// <param name="id">The report identifier</param>
        /// <response code="204">Report successfully deleted</response>
        /// <response code="400">Report ID is empty</response>
        /// <response code="500">Error during deletion</response>
        [HttpDelete("{id}")]
        [SwaggerOperation(
            Summary = "Deletes a report",
            Description = "Permanently removes a deck report from the system",
            OperationId = "DeleteDeckReport",
            Tags = new[] { "DeckReport" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteReport(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Report ID is empty");
                return BadRequest("Report ID cannot be empty");
            }

            try
            {
                await _reportService.DeleteReportAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting report {ReportId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
