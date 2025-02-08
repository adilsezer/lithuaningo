namespace Lithuaningo.API.DTOs.ChallengeStats;
using System.ComponentModel.DataAnnotations;

public class CreateChallengeStatsRequest
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int CompletedChallenges { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int TotalAttempts { get; set; }

        [Required]
        [Range(0, 100)]
        public double SuccessRate { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int CurrentStreak { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int BestStreak { get; set; }
    }