using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserProfile> GetUserProfileAsync(string userId);
        Task UpdateUserProfileAsync(UserProfile userProfile);
        Task CreateUserProfileAsync(string userId);
        Task DeleteUserProfileAsync(string userId);
    }
}
