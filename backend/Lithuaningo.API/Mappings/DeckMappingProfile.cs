using System;
using AutoMapper;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Deck;
using Lithuaningo.API.DTOs.DeckComment;
using Lithuaningo.API.DTOs.DeckReport;

namespace Lithuaningo.API.Mappings
{
    public class DeckMappingProfile : Profile
    {
        public DeckMappingProfile()
        {
            CreateMap<Deck, DeckResponse>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))
                .ForMember(dest => dest.FlashcardCount, opt => opt.MapFrom(src => src.FlashcardCount))
                .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Rating))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName));

            CreateMap<CreateDeckRequest, Deck>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.FlashcardCount, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => 0.0));

            CreateMap<UpdateDeckRequest, Deck>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<DeckComment, DeckCommentResponse>();

            // DeckReport mappings
            CreateMap<DeckReport, DeckReportResponse>();
            CreateMap<CreateDeckReportRequest, DeckReport>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "pending"))
                .ForMember(dest => dest.ReviewedBy, opt => opt.Ignore())
                .ForMember(dest => dest.Resolution, opt => opt.Ignore());
        }
    }
} 