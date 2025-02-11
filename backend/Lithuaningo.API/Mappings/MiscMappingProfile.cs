using System;
using System.Linq;
using System.Collections.Generic;
using AutoMapper;
using Lithuaningo.API.Models;
using Lithuaningo.API.Models.Quiz;
using Lithuaningo.API.DTOs.Announcement;
using Lithuaningo.API.DTOs.Quiz;
using Lithuaningo.API.DTOs.Word;
using Lithuaningo.API.DTOs.Leaderboard;
using Lithuaningo.API.DTOs.AppInfo;
using Lithuaningo.API.DTOs.ChallengeStats;
using Lithuaningo.API.DTOs.Comment;
using Lithuaningo.API.Utils;

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

            // Announcement mappings
            CreateMap<Announcement, AnnouncementResponse>();

            CreateMap<CreateAnnouncementRequest, Announcement>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<UpdateAnnouncementRequest, Announcement>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // Challenge Stats mappings
            CreateMap<ChallengeStats, ChallengeStatsResponse>();

            // Comment mappings
            CreateMap<Comment, CommentResponse>();
            CreateMap<CreateCommentRequest, Comment>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
            CreateMap<UpdateCommentRequest, Comment>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // Quiz mappings
            CreateMap<QuizQuestion, QuizQuestionResponse>();
            CreateMap<CreateQuizQuestionRequest, QuizQuestion>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.QuizDate, opt => opt.MapFrom(src => DateTime.UtcNow.Date))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => "multiple_choice"));

            // Word mappings
            CreateMap<WordForm, WordFormResponse>()
                .ForMember(dest => dest.TimeAgo, opt => opt.MapFrom(src => 
                    TimeFormatUtils.GetTimeAgo(src.CreatedAt)));
            CreateMap<Lemma, LemmaResponse>();

            // Leaderboard mappings
            CreateMap<LeaderboardWeek, LeaderboardResponse>();
            CreateMap<LeaderboardEntry, LeaderboardEntryResponse>()
                .ForMember(dest => dest.LastUpdatedTimeAgo, opt => opt.MapFrom(src => 
                    TimeFormatUtils.GetTimeAgo(src.LastUpdated)))
                .ForMember(dest => dest.Rank, opt => opt.MapFrom((src, dest, _, context) => 
                {
                    var entries = context.Items["Entries"] as List<LeaderboardEntry>;
                    if (entries == null) return 0;
                    return entries.OrderByDescending(e => e.Score).ToList().FindIndex(e => e.UserId == src.UserId) + 1;
                }));
        }
    }
} 