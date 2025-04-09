using AutoMapper;
using Lithuaningo.API.DTOs.AppInfo;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Mappings
{
    public class AppInfoMappingProfile : Profile
    {
        public AppInfoMappingProfile()
        {
            // AppInfo mappings
            CreateMap<AppInfo, AppInfoResponse>();
        }
    }
}