using Google.Cloud.Firestore;
using Lithuaningo.API.Services.Interfaces;

namespace Lithuaningo.API.Services;

public class AppInfoService : IAppInfoService
{
    private readonly FirestoreDb _db;
    private const string COLLECTION_NAME = "appInfo";

    public AppInfoService(FirestoreDb db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<AppInfo> GetAppInfoAsync(string platform)
    {
        if (string.IsNullOrEmpty(platform))
            throw new ArgumentNullException(nameof(platform));

        platform = platform.ToLowerInvariant();
        if (platform != "ios" && platform != "android")
            throw new ArgumentException("Platform must be either 'ios' or 'android'", nameof(platform));

        try
        {
            var docRef = _db.Collection(COLLECTION_NAME).Document(platform);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                // Return default app info if none exists
                return new AppInfo
                {
                    Id = platform,
                    LatestVersion = "1.0.0",
                    MandatoryUpdate = false,
                    UpdateUrl = string.Empty,
                    IsUnderMaintenance = false
                };
            }

            return snapshot.ConvertTo<AppInfo>();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error getting app info for {platform}: {ex.Message}");
            throw;
        }
    }

    public async Task UpdateAppInfoAsync(string platform, AppInfo appInfo)
    {
        if (string.IsNullOrEmpty(platform))
            throw new ArgumentNullException(nameof(platform));

        if (appInfo == null)
            throw new ArgumentNullException(nameof(appInfo));

        platform = platform.ToLowerInvariant();
        if (platform != "ios" && platform != "android")
            throw new ArgumentException("Platform must be either 'ios' or 'android'", nameof(platform));

        try
        {
            var docRef = _db.Collection(COLLECTION_NAME).Document(platform);
            appInfo.Id = platform;
            await docRef.SetAsync(appInfo);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error updating app info for {platform}: {ex.Message}");
            throw;
        }
    }
}