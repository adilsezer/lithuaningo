using AutoMapper;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Deck;
using Lithuaningo.API.Services.Interfaces;

namespace Lithuaningo.API.Mappings.Resolvers
{
    public class CardCountResolver : IValueResolver<Deck, DeckResponse, int>
    {
        private readonly IDeckService _deckService;
        
        public CardCountResolver(IDeckService deckService)
        {
            _deckService = deckService;
        }
        
        public int Resolve(Deck source, DeckResponse destination, int destMember, ResolutionContext context)
        {
            var flashcards = _deckService.GetDeckFlashcardsAsync(source.Id.ToString()).Result;
            return flashcards?.Count ?? 0;
        }
    }

    public class DeckRatingResolver : IValueResolver<Deck, DeckResponse, double>
    {
        private readonly IDeckVoteService _voteService;
        
        public DeckRatingResolver(IDeckVoteService voteService)
        {
            _voteService = voteService;
        }
        
        public double Resolve(Deck source, DeckResponse destination, double destMember, ResolutionContext context)
        {
            return _voteService.CalculateDeckRatingAsync(source.Id).Result;
        }
    }
} 