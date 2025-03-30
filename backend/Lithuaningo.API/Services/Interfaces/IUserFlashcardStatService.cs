using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IUserFlashcardStatService
    {
        /// <summary>
        /// Gets flashcard IDs that have been shown to a user
        /// </summary>
        /// <param name="userId">The user ID to check</param>
        /// <returns>A collection of flashcard IDs the user has seen</returns>
        Task<HashSet<Guid>> GetShownFlashcardIdsAsync(string userId);

        /// <summary>
        /// Marks flashcards as shown to a user
        /// </summary>
        /// <param name="flashcards">The flashcards to mark as shown</param>
        /// <param name="userId">The ID of the user who has seen the flashcards</param>
        Task MarkFlashcardsAsShownAsync(List<Flashcard> flashcards, string userId);
        
        /// <summary>
        /// Updates the stats for a flashcard for a specific user after review
        /// </summary>
        /// <param name="flashcardId">The ID of the flashcard</param>
        /// <param name="userId">The ID of the user</param>
        /// <param name="wasCorrect">Whether the user answered correctly</param>
        /// <returns>The updated user flashcard stat</returns>
        Task<UserFlashcardStat> UpdateFlashcardStatsAsync(Guid flashcardId, string userId, bool wasCorrect);
    }
} 