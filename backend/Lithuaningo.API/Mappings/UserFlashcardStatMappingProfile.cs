using AutoMapper;
using Lithuaningo.API.DTOs.UserFlashcardStats;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Mappings
{
    public class UserFlashcardStatMappingProfile : Profile
    {
        public UserFlashcardStatMappingProfile()
        {
            CreateMap<UserFlashcardStat, SubmitFlashcardAnswerRequest>().ReverseMap();
            CreateMap<UserFlashcardStat, UserFlashcardStatResponse>();
            // Map collection of flashcard stats to summary
            CreateMap<IEnumerable<UserFlashcardStat>, UserFlashcardStatsSummaryResponse>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.FirstOrDefault() != null ? src.First().UserId : string.Empty))
                .ForMember(dest => dest.TotalFlashcards, opt => opt.MapFrom(src => src.Count()))
                .ForMember(dest => dest.TotalViews, opt => opt.MapFrom(src => src.Sum(s => s.ViewCount)))
                .ForMember(dest => dest.TotalCorrectAnswers, opt => opt.MapFrom(src => src.Sum(s => s.CorrectCount)))
                .ForMember(dest => dest.TotalIncorrectAnswers, opt => opt.MapFrom(src => src.Sum(s => s.IncorrectCount)))
                .ForMember(dest => dest.AverageMasteryLevel, opt => opt.MapFrom(src =>
                    src.Any() ? src.Average(s => s.MasteryLevel) : 0))
                // Set default to 0 since we'll calculate this with a separate query
                .ForMember(dest => dest.FlashcardsViewedToday, opt => opt.MapFrom(src => 0));
        }
    }
}