using AutoMapper;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.DeckComment;
using Lithuaningo.API.DTOs.DeckReport;
using Lithuaningo.API.Services.Interfaces;

namespace Lithuaningo.API.Mappings.Resolvers
{
    public class DeckCommentUserNameResolver : IValueResolver<DeckComment, DeckCommentResponse, string>
    {
        private readonly IUserProfileService _userProfileService;
        
        public DeckCommentUserNameResolver(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
        }
        
        public string Resolve(DeckComment source, DeckCommentResponse destination, string destMember, ResolutionContext context)
        {
            var profile = _userProfileService.GetUserProfileAsync(source.UserId.ToString()).Result;
            return profile?.FullName ?? "Unknown User";
        }
    }

    public class ReportedByUserNameResolver : IValueResolver<DeckReport, DeckReportResponse, string>
    {
        private readonly IUserProfileService _userProfileService;
        
        public ReportedByUserNameResolver(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
        }
        
        public string Resolve(DeckReport source, DeckReportResponse destination, string destMember, ResolutionContext context)
        {
            var profile = _userProfileService.GetUserProfileAsync(source.UserId.ToString()).Result;
            return profile?.FullName ?? "Unknown User";
        }
    }

    public class ReviewedByUserNameResolver : IValueResolver<DeckReport, DeckReportResponse, string?>
    {
        private readonly IUserProfileService _userProfileService;
        
        public ReviewedByUserNameResolver(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
        }
        
        public string? Resolve(DeckReport source, DeckReportResponse destination, string? destMember, ResolutionContext context)
        {
            if (!source.ReviewerId.HasValue) return null;
            var profile = _userProfileService.GetUserProfileAsync(source.ReviewerId.Value.ToString()).Result;
            return profile?.FullName;
        }
    }
} 