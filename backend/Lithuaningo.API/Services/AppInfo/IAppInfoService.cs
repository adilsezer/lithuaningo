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

        /// <summary>
        /// Updates (or inserts) app information for the specified platform using an upsert operation.
        /// </summary>
        /// <param name="platform">The platform (ios/android) to update.</param>
        /// <param name="request">The new app information.</param>
        /// <returns>The upserted AppInfo record.</returns>
        Task<AppInfoResponse> UpdateAppInfoAsync(string platform, UpdateAppInfoRequest request);

        /// <summary>
        /// Deletes the app information with the specified ID.
        /// </summary>
        /// <param name="id">The ID of the app info record to delete.</param>
        Task DeleteAppInfoAsync(string id);
    }
}
