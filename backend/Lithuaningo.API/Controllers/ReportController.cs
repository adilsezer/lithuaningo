using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpPost]
        public async Task<ActionResult<string>> CreateReport([FromBody] Report report)
        {
            var reportId = await _reportService.CreateReportAsync(report);
            return Ok(reportId);
        }

        [HttpGet]
        public async Task<ActionResult<List<Report>>> GetReports([FromQuery] string status = "pending", [FromQuery] int limit = 50)
        {
            var reports = status == "pending" 
                ? await _reportService.GetPendingReportsAsync(limit)
                : await _reportService.GetReportsByStatusAsync(status);
            return Ok(reports);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Report>> GetReport(string id)
        {
            var report = await _reportService.GetReportByIdAsync(id);
            if (report == null)
                return NotFound();
            return Ok(report);
        }

        [HttpGet("content/{contentType}/{contentId}")]
        public async Task<ActionResult<List<Report>>> GetContentReports(string contentType, string contentId)
        {
            var reports = await _reportService.GetContentReportsAsync(contentType, contentId);
            return Ok(reports);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult> UpdateReportStatus(string id, [FromBody] Report report)
        {
            if (report.Id != id)
            {
                return BadRequest("Report ID mismatch");
            }

            await _reportService.UpdateReportStatusAsync(
                id,
                report.Status,
                report.ReviewedBy ?? "",
                report.Resolution);
            return NoContent();
        }
    }
} 