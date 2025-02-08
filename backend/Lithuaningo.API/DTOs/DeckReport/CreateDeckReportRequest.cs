namespace Lithuaningo.API.DTOs.DeckReport
{
    public class CreateDeckReportRequest
    {
        // The ID of the deck being reported (as a string to validate GUID format).
        public string DeckId { get; set; } = string.Empty;
        
        public string Reason { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        
        // The ID of the user reporting the deck.
        public Guid ReportedBy { get; set; }
    }
}
