using System;
using AutoMapper;
using Lithuaningo.API.DTOs.UserProfile;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Mappings
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {
            CreateMap<UserProfile, UserProfileResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.EmailVerified, opt => opt.MapFrom(src => src.EmailVerified))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.AvatarUrl))
                .ForMember(dest => dest.LastLoginAt, opt => opt.MapFrom(src => src.LastLoginAt))
                .ForMember(dest => dest.IsAdmin, opt => opt.MapFrom(src => src.IsAdmin))
                .ForMember(dest => dest.IsPremium, opt => opt.MapFrom(src => src.IsPremium))
                .ForMember(dest => dest.AuthProvider, opt => opt.MapFrom(src => src.AuthProvider))
                .ForMember(dest => dest.TermsAccepted, opt => opt.MapFrom(src => src.TermsAccepted));

            CreateMap<UpdateUserProfileRequest, UserProfile>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.EmailVerified, opt => opt.MapFrom(src => src.EmailVerified))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.AvatarUrl))
                .ForMember(dest => dest.IsAdmin, opt => opt.MapFrom(src => src.IsAdmin))
                .ForMember(dest => dest.IsPremium, opt => opt.Ignore())
                .ForMember(dest => dest.TermsAccepted, opt => opt.MapFrom(src => src.TermsAccepted));
        }
    }
}