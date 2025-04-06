using AutoMapper;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.Models.Challenge;

namespace Lithuaningo.API.Mappings
{
    public class ChallengeMappingProfile : Profile
    {
        public ChallengeMappingProfile()
        {
            // Challenge mappings
            CreateMap<ChallengeQuestion, ChallengeQuestionResponse>();
            CreateMap<ChallengeQuestionResponse, ChallengeQuestion>();
        }
    }
}