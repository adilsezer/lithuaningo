using AutoMapper;
using Lithuaningo.API.DTOs.Leaderboard;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Mappings
{
    public class LeaderboardMappingProfile : Profile
    {
        public LeaderboardMappingProfile()
        {
            // Leaderboard mappings
            CreateMap<LeaderboardEntry, LeaderboardEntryResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.Score, opt => opt.MapFrom(src => src.Score))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username))
                .ForMember(dest => dest.Rank, opt => opt.Ignore()); // Rank is calculated in the service
        }
    }
}