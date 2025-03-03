using System;
using AutoMapper;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Flashcard;
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
                .ForMember(dest => dest.AudioUrl, opt => opt.MapFrom(src => src.AudioUrl))
                .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Notes))
                .ForMember(dest => dest.Level, opt => opt.MapFrom(src => src.Level));

            CreateMap<CreateFlashcardRequest, Flashcard>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.FrontWord, opt => opt.MapFrom(src => src.FrontWord))
                .ForMember(dest => dest.BackWord, opt => opt.MapFrom(src => src.BackWord))
                .ForMember(dest => dest.ExampleSentence, opt => opt.MapFrom(src => src.ExampleSentence))
                .ForMember(dest => dest.ExampleSentenceTranslation, opt => opt.MapFrom(src => src.ExampleSentenceTranslation))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl))
                .ForMember(dest => dest.AudioUrl, opt => opt.MapFrom(src => src.AudioUrl))
                .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Notes))
                .ForMember(dest => dest.Level, opt => opt.MapFrom(src => src.Level))
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
        }
    }
} 