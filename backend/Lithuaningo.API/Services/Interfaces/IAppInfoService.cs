using Lithuaningo.API.Models;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IAppInfoService
    {
        /// <summary>
        /// Retrieves app information for the specified platform.
        /// </summary>
        /// <param name="platform">The platform (ios/android) to get info for.</param>
        /// <returns>App information for the specified platform.</returns>
        Task<AppInfo> GetAppInfoAsync(string platform);

        /// <summary>
        /// Updates (or inserts) app information for the specified platform using an upsert operation.
        /// </summary>
        /// <param name="platform">The platform (ios/android) to update.</param>
        /// <param name="appInfo">The new app information.</param>
        /// <returns>The upserted AppInfo record.</returns>
        Task<AppInfo> UpdateAppInfoAsync(string platform, AppInfo appInfo);

        /// <summary>
        /// Deletes the app information with the specified ID.
        /// </summary>
        /// <param name="id">The ID of the app info record to delete.</param>
        Task DeleteAppInfoAsync(string id);
    }
}
