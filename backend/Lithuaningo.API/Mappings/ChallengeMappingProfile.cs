using AutoMapper;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Mappings
{
    public class ChallengeMappingProfile : Profile
    {
        public ChallengeMappingProfile()
        {
            // Challenge mappings
            CreateMap<ChallengeQuestion, ChallengeQuestionResponse>()
                .ForMember(dest => dest.FlashcardId, opt => opt.MapFrom(src => src.FlashcardId))
                .ForMember(dest => dest.Explanation, opt => opt.MapFrom(src => src.Explanation));
            CreateMap<ChallengeQuestionResponse, ChallengeQuestion>()
                .ForMember(dest => dest.FlashcardId, opt => opt.MapFrom(src => src.FlashcardId))
                .ForMember(dest => dest.Explanation, opt => opt.MapFrom(src => src.Explanation));
        }
    }
}