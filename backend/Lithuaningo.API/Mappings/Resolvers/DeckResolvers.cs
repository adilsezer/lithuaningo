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
        private readonly IDeckService _deckService;
        
        public DeckRatingResolver(IDeckService deckService)
        {
            _deckService = deckService;
        }
        
        public double Resolve(Deck source, DeckResponse destination, double destMember, ResolutionContext context)
        {
            return _deckService.GetDeckRatingAsync(source.Id.ToString()).Result;
        }
    }

    public class DeckCreatorNameResolver : IValueResolver<Deck, DeckResponse, string>
    {
        private readonly IUserProfileService _userProfileService;
        
        public DeckCreatorNameResolver(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
        }
        
        public string Resolve(Deck source, DeckResponse destination, string destMember, ResolutionContext context)
        {
            var profile = _userProfileService.GetUserProfileAsync(source.CreatedBy.ToString()).Result;
            return profile?.FullName ?? "Unknown User";
        }
    }
} 