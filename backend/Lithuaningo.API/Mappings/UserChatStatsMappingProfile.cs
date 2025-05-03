using AutoMapper;
using Lithuaningo.API.DTOs.UserChatStats;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Stats;

namespace Lithuaningo.API.Mappings
{
    /// <summary>
    /// AutoMapper profile for mapping between UserChatStats and UserChatStatsResponse
    /// </summary>
    public class UserChatStatsMappingProfile : Profile
    {
        public UserChatStatsMappingProfile()
        {
            // Map from UserChatStats to UserChatStatsResponse
            CreateMap<UserChatStats, UserChatStatsResponse>()
                .ForMember(dest => dest.LastChatDate, opt => opt.MapFrom(src => src.LastChatDate))
                .ForMember(dest => dest.TodayMessageCount, opt => opt.MapFrom(src => src.TodayMessageCount))
                .ForMember(dest => dest.TotalMessageCount, opt => opt.MapFrom(src => src.TotalMessageCount))
                .ForMember(dest => dest.MaxFreeMessagesPerDay, opt => opt.MapFrom(src =>
                    UserChatStatsService.MaxFreeMessagesPerDay))
                .ForMember(dest => dest.HasReachedDailyLimit, opt => opt.MapFrom(src =>
                    src.TodayMessageCount >= UserChatStatsService.MaxFreeMessagesPerDay));
        }
    }
}