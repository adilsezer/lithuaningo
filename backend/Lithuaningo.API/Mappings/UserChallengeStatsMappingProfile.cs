using System;
using AutoMapper;
using Lithuaningo.API.DTOs.UserChallengeStats;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Mappings
{
    public class UserChallengeStatsMappingProfile : Profile
    {
        public UserChallengeStatsMappingProfile()
        {
            // User Challenge Stats mappings
            CreateMap<UserChallengeStats, UserChallengeStatsResponse>()
                .ForMember(dest => dest.HasCompletedTodayChallenge, opt => opt.MapFrom(src =>
                    src.TodayCorrectAnswerCount + src.TodayIncorrectAnswerCount >= 10))
                .ForMember(dest => dest.TodayCorrectAnswers, opt => opt.MapFrom(src =>
                    src.TodayCorrectAnswerCount))
                .ForMember(dest => dest.TodayIncorrectAnswers, opt => opt.MapFrom(src =>
                    src.TodayIncorrectAnswerCount))
                .ForMember(dest => dest.TotalChallengesCompleted, opt => opt.MapFrom(src =>
                    src.TotalChallengesCompleted));
        }
    }
}