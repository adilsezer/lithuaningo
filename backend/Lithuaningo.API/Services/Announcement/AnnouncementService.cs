using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly FirestoreDb _db;
    private readonly string _collectionName;

    public AnnouncementService(FirestoreDb db, IOptions<FirestoreCollectionSettings> collectionSettings)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _collectionName = collectionSettings.Value.Announcements;
    }

    public async Task<IEnumerable<Announcement>> GetAnnouncementsAsync()
    {
        try
        {
            var snapshot = await _db.Collection(_collectionName)
                .Limit(10)
                .GetSnapshotAsync();
            return snapshot.Documents.Select(doc => doc.ConvertTo<Announcement>());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error getting announcements: {ex.Message}");
            throw;
        }
    }

    public async Task CreateAnnouncementAsync(Announcement announcement)
    {
        if (announcement == null)
            throw new ArgumentNullException(nameof(announcement));

        try
        {
            var docRef = _db.Collection(_collectionName).Document();
            announcement.Id = docRef.Id;
            await docRef.SetAsync(announcement);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error creating announcement: {ex.Message}");
            throw;
        }
    }

    public async Task DeleteAnnouncementAsync(string id)
    {
        if (string.IsNullOrEmpty(id))
            throw new ArgumentNullException(nameof(id));

        try
        {
            await _db.Collection(_collectionName).Document(id).DeleteAsync();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting announcement: {ex.Message}");
            throw;
        }
    }
}