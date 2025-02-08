using System;
using AutoMapper;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.UserProfile;
using Lithuaningo.API.Utils;

namespace Lithuaningo.API.Mappings
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {
            CreateMap<UserProfile, UserProfileResponse>()
                .ForMember(dest => dest.Email, opt => opt.Ignore())
                .ForMember(dest => dest.TimeAgo, opt => opt.MapFrom(src => 
                    TimeFormatUtils.GetTimeAgo(src.CreatedAt)))
                .ForMember(dest => dest.LastLoginTimeAgo, opt => opt.MapFrom(src => 
                    TimeFormatUtils.GetTimeAgo(src.LastLoginAt)));

            CreateMap<CreateUserProfileRequest, UserProfile>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.UserId)))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.LastLoginAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<UpdateUserProfileRequest, UserProfile>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        }
    }
} 