using System;
using System.Linq;
using System.Collections.Generic;
using AutoMapper;
using Lithuaningo.API.Models;
using Lithuaningo.API.Models.Challenge;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.DTOs.Leaderboard;
using Lithuaningo.API.DTOs.AppInfo;
using Lithuaningo.API.DTOs.UserChallengeStats;

namespace Lithuaningo.API.Mappings
{
    public class MiscMappingProfile : Profile
    {
        public MiscMappingProfile()
        {
            // AppInfo mappings
            CreateMap<AppInfo, AppInfoResponse>();
            CreateMap<UpdateAppInfoRequest, AppInfo>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

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
            CreateMap<CreateChallengeRequest, ChallengeQuestion>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => "multiple_choice"));

            // Leaderboard mappings
            CreateMap<LeaderboardEntry, LeaderboardEntryResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.Score, opt => opt.MapFrom(src => src.Score))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username));
        }
    }
} 