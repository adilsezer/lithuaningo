namespace Lithuaningo.API.DTOs.DeckReport
{
    public class UpdateDeckReportRequest
    {
        public string Status { get; set; } = string.Empty;
        
        // Optionally, the reviewer’s ID as a string (or Guid); here we use string for flexibility.
        public string? ReviewedBy { get; set; }
        
        public string Resolution { get; set; } = string.Empty;
    }
}
