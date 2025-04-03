using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Lithuaningo.API.DTOs.AppInfo;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.DTOs.Leaderboard;
using Lithuaningo.API.DTOs.UserChallengeStats;
using Lithuaningo.API.Models;
using Lithuaningo.API.Models.Challenge;

namespace Lithuaningo.API.Mappings
{
    public class MiscMappingProfile : Profile
    {
        public MiscMappingProfile()
        {
            // AppInfo mappings
            CreateMap<AppInfo, AppInfoResponse>();
            CreateMap<UpdateAppInfoRequest, AppInfo>();

            // User Challenge Stats mappings
            CreateMap<UserChallengeStats, UserChallengeStatsResponse>()
                .ForMember(dest => dest.HasCompletedTodayChallenge, opt => opt.MapFrom(src =>
                    src.LastChallengeDate.Date == DateTime.UtcNow.Date))
                .ForMember(dest => dest.TodayCorrectAnswers, opt => opt.MapFrom(src =>
                    src.TodayCorrectAnswerCount))
                .ForMember(dest => dest.TodayIncorrectAnswers, opt => opt.MapFrom(src =>
                    src.TodayIncorrectAnswerCount));

            // Challenge mappings
            CreateMap<ChallengeQuestion, ChallengeQuestionResponse>();


            // Leaderboard mappings
            CreateMap<LeaderboardEntry, LeaderboardEntryResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.Score, opt => opt.MapFrom(src => src.Score))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username));
        }
    }
}