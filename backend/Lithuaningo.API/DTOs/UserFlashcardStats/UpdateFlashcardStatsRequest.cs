using System;

namespace Lithuaningo.API.DTOs.UserFlashcardStats
{
    public class UpdateFlashcardStatsRequest
    {
        public Guid FlashcardId { get; set; }
        public bool WasCorrect { get; set; }
        public string? UserId { get; set; }
    }
} 