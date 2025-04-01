using AutoMapper;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Flashcard;
using System.Linq;

namespace Lithuaningo.API.Mappings
{
    public class FlashcardMappingProfile : Profile
    {
        public FlashcardMappingProfile()
        {
            CreateMap<Flashcard, FlashcardResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.FrontWord, opt => opt.MapFrom(src => src.FrontWord))
                .ForMember(dest => dest.BackWord, opt => opt.MapFrom(src => src.BackWord))
                .ForMember(dest => dest.ExampleSentence, opt => opt.MapFrom(src => src.ExampleSentence))
                .ForMember(dest => dest.ExampleSentenceTranslation, 
                    opt => opt.MapFrom(src => src.ExampleSentenceTranslation))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl))
                .ForMember(dest => dest.AudioUrl, opt => opt.MapFrom(src => src.AudioUrl))
                .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Notes))
                .ForMember(dest => dest.Categories, 
                    opt => opt.MapFrom(src => src.Categories != null 
                        ? src.Categories.Select(c => (WordCategory)c).ToList() 
                        : new List<WordCategory>()))
                .ForMember(dest => dest.Difficulty, opt => opt.MapFrom(src => src.Difficulty))
                .ForMember(dest => dest.IsVerified, opt => opt.MapFrom(src => src.IsVerified));

            CreateMap<FlashcardResponse, Flashcard>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.FrontWord, opt => opt.MapFrom(src => src.FrontWord))
                .ForMember(dest => dest.BackWord, opt => opt.MapFrom(src => src.BackWord))
                .ForMember(dest => dest.ExampleSentence, opt => opt.MapFrom(src => src.ExampleSentence))
                .ForMember(dest => dest.ExampleSentenceTranslation, 
                    opt => opt.MapFrom(src => src.ExampleSentenceTranslation))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl))
                .ForMember(dest => dest.AudioUrl, opt => opt.MapFrom(src => src.AudioUrl))
                .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Notes))
                .ForMember(dest => dest.Categories, 
                    opt => opt.MapFrom(src => src.Categories != null 
                        ? src.Categories.Select(c => (int)c).ToList() 
                        : new List<int>()))
                .ForMember(dest => dest.Difficulty, opt => opt.MapFrom(src => src.Difficulty))
                .ForMember(dest => dest.IsVerified, opt => opt.MapFrom(src => src.IsVerified));
        }
    }
} 