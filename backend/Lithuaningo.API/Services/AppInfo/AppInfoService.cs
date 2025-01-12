using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using System;
using System.Threading.Tasks;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services;

public class AppInfoService : IAppInfoService
{
    private readonly FirestoreDb _db;
    private readonly string _collectionName;

    public AppInfoService(FirestoreDb db, IOptions<FirestoreCollectionSettings> collectionSettings)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _collectionName = collectionSettings.Value.AppInfo;
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
            var docRef = _db.Collection(_collectionName).Document(platform);
            var snapshot = await docRef.GetSnapshotAsync();
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
            var docRef = _db.Collection(_collectionName).Document(platform);
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