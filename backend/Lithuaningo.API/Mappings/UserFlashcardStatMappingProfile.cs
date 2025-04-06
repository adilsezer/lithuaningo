using AutoMapper;
using Lithuaningo.API.DTOs.UserFlashcardStats;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Mapping
{
    public class UserFlashcardStatMappingProfile : Profile
    {
        public UserFlashcardStatMappingProfile()
        {
            CreateMap<UserFlashcardStat, SubmitFlashcardAnswerRequest>().ReverseMap();
            CreateMap<UserFlashcardStat, UserFlashcardStatResponse>();
        }
    }
}