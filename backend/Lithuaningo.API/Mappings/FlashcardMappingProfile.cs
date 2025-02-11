using System;
using AutoMapper;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.DTOs.UserFlashcardStats;
using Lithuaningo.API.Utils;

namespace Lithuaningo.API.Mappings
{
    public class FlashcardMappingProfile : Profile
    {
        public FlashcardMappingProfile()
        {
            CreateMap<Flashcard, FlashcardResponse>()
                .ForMember(dest => dest.LastReviewedTimeAgo, opt => opt.MapFrom(src => 
                    src.LastReviewedAt.HasValue ? TimeFormatUtils.GetTimeAgo(src.LastReviewedAt.Value) : null))
                .ForMember(dest => dest.TimeAgo, opt => opt.MapFrom(src => 
                    TimeFormatUtils.GetTimeAgo(src.CreatedAt)));

            CreateMap<CreateFlashcardRequest, Flashcard>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.LastReviewedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CorrectRate, opt => opt.MapFrom(src => 0.0));

            CreateMap<UpdateFlashcardRequest, Flashcard>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<UpdateReviewRequest, Flashcard>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.LastReviewedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom((src, dest) => dest.ReviewCount + 1));

            // UserFlashcardStats mappings
            CreateMap<UserFlashcardStats, UserFlashcardStatsResponse>()
                .ForMember(dest => dest.AccuracyRate, opt => opt.MapFrom(src => 
                    src.ConfidenceLevel > 0 ? src.ConfidenceLevel * 20.0 : 0))
                .ForMember(dest => dest.LastReviewedTimeAgo, opt => opt.MapFrom(src => 
                    TimeFormatUtils.GetTimeAgo(src.LastReviewedAt)))
                .ForMember(dest => dest.NextReviewDue, opt => opt.MapFrom(src => 
                    src.NextReviewAt.HasValue ? TimeFormatUtils.GetTimeRemaining(src.NextReviewAt.Value) : null));

            CreateMap<TrackProgressRequest, UserFlashcardStats>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        }
    }
} 