using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.DTOs.DeckReport;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using AutoMapper;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Controller for managing deck reports
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class DeckReportController : ControllerBase
    {
        private readonly IDeckReportService _reportService;
        private readonly ILogger<DeckReportController> _logger;
        private readonly IMapper _mapper;

        public DeckReportController(
            IDeckReportService reportService,
            ILogger<DeckReportController> logger,
            IMapper mapper)
        {
            _reportService = reportService ?? throw new ArgumentNullException(nameof(reportService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        /// <summary>
        /// Creates a new deck report
        /// </summary>
        /// <param name="request">The report creation request</param>
        /// <returns>The created report</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DeckReportResponse>> CreateReport([FromBody] CreateDeckReportRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var report = _mapper.Map<DeckReport>(request);
                var reportId = await _reportService.CreateReportAsync(report);
                var createdReport = await _reportService.GetReportByIdAsync(reportId);
                var response = _mapper.Map<DeckReportResponse>(createdReport);
                return CreatedAtAction(nameof(GetReport), new { id = response.Id }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating report");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets all reports with optional status filter
        /// </summary>
        /// <param name="status">The report status to filter by (default: "pending")</param>
        /// <param name="limit">Maximum number of reports to return</param>
        /// <returns>List of reports matching the criteria</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
                List<DeckReport> reports = status.ToLower() == "pending"
                    ? await _reportService.GetPendingReportsAsync(limit)
                    : await _reportService.GetReportsByStatusAsync(status);

                var response = _mapper.Map<List<DeckReportResponse>>(reports);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reports with status {Status}", status);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets a specific report by ID
        /// </summary>
        /// <param name="id">The report identifier</param>
        /// <returns>The requested report</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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

                var response = _mapper.Map<DeckReportResponse>(report);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report {ReportId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets all reports for a specific deck
        /// </summary>
        /// <param name="deckId">The deck identifier</param>
        /// <returns>List of reports for the deck</returns>
        [HttpGet("deck/{deckId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
                var response = _mapper.Map<List<DeckReportResponse>>(reports);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reports for deck {DeckId}", deckId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates the status of a report
        /// </summary>
        /// <param name="id">The report identifier</param>
        /// <param name="request">The status update request</param>
        /// <returns>The updated report</returns>
        [HttpPut("{id}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
                    request.ReviewedBy,
                    request.Resolution);

                var updatedReport = await _reportService.GetReportByIdAsync(id);
                if (updatedReport == null)
                {
                    return NotFound();
                }

                var response = _mapper.Map<DeckReportResponse>(updatedReport);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating report status for {ReportId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deletes a report
        /// </summary>
        /// <param name="id">The report identifier</param>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
