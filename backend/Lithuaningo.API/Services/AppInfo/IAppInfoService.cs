using System.Threading.Tasks;
using Lithuaningo.API.DTOs.AppInfo;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.AppInfo
{
    public interface IAppInfoService
    {
        /// <summary>
        /// Retrieves app information for the specified platform.
        /// </summary>
        /// <param name="platform">The platform (ios/android) to get info for.</param>
        /// <returns>App information for the specified platform.</returns>
        Task<AppInfoResponse?> GetAppInfoAsync(string platform);
    }
}
