using System;
using AutoMapper;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Deck;
using Lithuaningo.API.DTOs.Comment;
using Lithuaningo.API.DTOs.DeckReport;
using Lithuaningo.API.Utils;
using Lithuaningo.API.Mappings.Resolvers;

namespace Lithuaningo.API.Mappings
{
    public class DeckMappingProfile : Profile
    {
        public DeckMappingProfile()
        {
            CreateMap<Deck, DeckResponse>()
                .ForMember(dest => dest.CardCount, opt => opt.MapFrom<CardCountResolver>())
                .ForMember(dest => dest.Rating, opt => opt.MapFrom<DeckRatingResolver>())
                .ForMember(dest => dest.CreatedByUserName, opt => opt.MapFrom<DeckCreatorNameResolver>())
                .ForMember(dest => dest.TimeAgo, opt => opt.MapFrom(src => 
                    TimeFormatUtils.GetTimeAgo(src.CreatedAt)));

            CreateMap<CreateDeckRequest, Deck>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsPublic, opt => opt.MapFrom(src => true));

            CreateMap<UpdateDeckRequest, Deck>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // Comment mappings
            CreateMap<Comment, CommentResponse>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom<CommentUserNameResolver>())
                .ForMember(dest => dest.TimeAgo, opt => opt.MapFrom(src => 
                    TimeFormatUtils.GetTimeAgo(src.CreatedAt)));

            CreateMap<CreateCommentRequest, Comment>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsEdited, opt => opt.MapFrom(src => false));

            CreateMap<UpdateCommentRequest, Comment>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsEdited, opt => opt.MapFrom(src => true));

            // DeckReport mappings
            CreateMap<DeckReport, DeckReportResponse>()
                .ForMember(dest => dest.ReportedByUserName, opt => opt.MapFrom<ReportedByUserNameResolver>())
                .ForMember(dest => dest.ReviewedByUserName, opt => opt.MapFrom<ReviewedByUserNameResolver>())
                .ForMember(dest => dest.TimeAgo, opt => opt.MapFrom(src => 
                    TimeFormatUtils.GetTimeAgo(src.CreatedAt)));

            CreateMap<CreateDeckReportRequest, DeckReport>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "pending"))
                .ForMember(dest => dest.ReviewedBy, opt => opt.Ignore())
                .ForMember(dest => dest.Resolution, opt => opt.Ignore());
        }
    }
} 