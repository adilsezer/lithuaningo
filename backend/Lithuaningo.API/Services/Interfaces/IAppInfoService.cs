
namespace Lithuaningo.API.Services.Interfaces;

public interface IAppInfoService
{
    /// <summary>
    /// Retrieves app information for the specified platform
    /// </summary>
    /// <param name="platform">The platform (ios/android) to get info for</param>
    /// <returns>App information for the specified platform</returns>
    Task<AppInfo> GetAppInfoAsync(string platform);

    /// <summary>
    /// Updates app information for the specified platform
    /// </summary>
    /// <param name="platform">The platform (ios/android) to update</param>
    /// <param name="appInfo">The new app information</param>
    Task UpdateAppInfoAsync(string platform, AppInfo appInfo);
}