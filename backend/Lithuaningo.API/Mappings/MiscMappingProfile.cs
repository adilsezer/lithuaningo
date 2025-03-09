using System;
using System.Linq;
using System.Collections.Generic;
using AutoMapper;
using Lithuaningo.API.Models;
using Lithuaningo.API.Models.Challenge;
using Lithuaningo.API.DTOs.Announcement;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.DTOs.Leaderboard;
using Lithuaningo.API.DTOs.AppInfo;
using Lithuaningo.API.DTOs.UserChallengeStats;
using Lithuaningo.API.DTOs.DeckComment;
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

            // User Challenge Stats mappings
            CreateMap<UserChallengeStats, UserChallengeStatsResponse>();

            // Deck Comment mappings
            CreateMap<DeckComment, DeckCommentResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.DeckId, opt => opt.MapFrom(src => src.DeckId))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt));

            CreateMap<CreateDeckCommentRequest, DeckComment>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.DeckId, opt => opt.MapFrom(src => src.DeckId))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<UpdateDeckCommentRequest, DeckComment>()
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // Challenge mappings
            CreateMap<ChallengeQuestion, ChallengeQuestionResponse>();
            CreateMap<CreateChallengeQuestionRequest, ChallengeQuestion>()
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