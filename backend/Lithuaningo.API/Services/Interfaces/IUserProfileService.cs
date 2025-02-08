using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IUserProfileService
    {
        Task<UserProfile?> GetUserProfileAsync(string userId);
        Task<UserProfile> CreateUserProfileAsync(string userId);
        Task<UserProfile> UpdateUserProfileAsync(UserProfile userProfile);
        Task<bool> DeleteUserProfileAsync(string userId);
        Task UpdateLastLoginAsync(string userId);
    }
}
