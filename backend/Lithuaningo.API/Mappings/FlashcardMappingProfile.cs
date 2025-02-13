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
                .ForMember(dest => dest.FrontWord, opt => opt.MapFrom(src => src.FrontWord))
                .ForMember(dest => dest.BackWord, opt => opt.MapFrom(src => src.BackWord))
                .ForMember(dest => dest.ExampleSentence, opt => opt.MapFrom(src => src.ExampleSentence))
                .ForMember(dest => dest.ExampleSentenceTranslation, opt => opt.MapFrom(src => src.ExampleSentenceTranslation))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl))
                .ForMember(dest => dest.AudioUrl, opt => opt.MapFrom(src => src.AudioUrl));

            CreateMap<CreateFlashcardRequest, Flashcard>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.FrontWord, opt => opt.MapFrom(src => src.FrontWord))
                .ForMember(dest => dest.BackWord, opt => opt.MapFrom(src => src.BackWord))
                .ForMember(dest => dest.ExampleSentence, opt => opt.MapFrom(src => src.ExampleSentence))
                .ForMember(dest => dest.ExampleSentenceTranslation, opt => opt.MapFrom(src => src.ExampleSentenceTranslation))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl))
                .ForMember(dest => dest.AudioUrl, opt => opt.MapFrom(src => src.AudioUrl))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<UpdateFlashcardRequest, Flashcard>()
                .ForMember(dest => dest.FrontWord, opt => opt.MapFrom(src => src.FrontWord))
                .ForMember(dest => dest.BackWord, opt => opt.MapFrom(src => src.BackWord))
                .ForMember(dest => dest.ExampleSentence, opt => opt.MapFrom(src => src.ExampleSentence))
                .ForMember(dest => dest.ExampleSentenceTranslation, opt => opt.MapFrom(src => src.ExampleSentenceTranslation))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl))
                .ForMember(dest => dest.AudioUrl, opt => opt.MapFrom(src => src.AudioUrl))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // UserFlashcardStats mappings
            CreateMap<UserFlashcardStats, UserFlashcardStatsResponse>()
                .ForMember(dest => dest.AccuracyRate, opt => opt.MapFrom(src => src.AccuracyRate))
                .ForMember(dest => dest.TotalReviewed, opt => opt.MapFrom(src => src.TotalReviewed))
                .ForMember(dest => dest.CorrectAnswers, opt => opt.MapFrom(src => src.CorrectAnswers))
                .ForMember(dest => dest.LastReviewedAt, opt => opt.MapFrom(src => src.LastReviewedAt))
                .ForMember(dest => dest.NextReviewDue, opt => opt.MapFrom(src => 
                    src.NextReviewDue.HasValue ? TimeFormatUtils.GetTimeRemaining(src.NextReviewDue.Value) : null));

            CreateMap<TrackProgressRequest, UserFlashcardStats>()
                .ForMember(dest => dest.FlashcardId, opt => opt.MapFrom(src => Guid.Parse(src.FlashcardId)))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.LastReviewedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        }
    }
} 