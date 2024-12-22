public interface IUserService
{
    Task<UserProfile> GetUserProfileAsync(string userId);
    Task UpdateUserProfileAsync(UserProfile userProfile);
}