using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.DeckVote;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IDeckVoteService
    {
        /// <summary>
        /// Gets a user's vote for a specific deck
        /// </summary>
        Task<DeckVoteResponse?> GetUserVoteAsync(Guid deckId, Guid userId);

        /// <summary>
        /// Records a vote for a deck
        /// </summary>
        Task<bool> VoteDeckAsync(Guid deckId, Guid userId, bool isUpvote);

        /// <summary>
        /// Gets all votes for a specific deck
        /// </summary>
        Task<List<DeckVoteResponse>> GetDeckVotesAsync(Guid deckId);

        /// <summary>
        /// Gets the total upvotes and downvotes for a deck
        /// </summary>
        Task<(int upvotes, int downvotes)> GetDeckVoteCountsAsync(Guid deckId);

        /// <summary>
        /// Calculates the rating for a deck based on votes
        /// </summary>
        Task<double> CalculateDeckRatingAsync(Guid deckId, string timeRange = "all");
    }
} 