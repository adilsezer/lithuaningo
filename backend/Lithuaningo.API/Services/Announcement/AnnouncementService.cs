using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly FirestoreDb _db;
    private const string COLLECTION_NAME = "announcements";

    public AnnouncementService(FirestoreDb db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<IEnumerable<Announcement>> GetAnnouncementsAsync()
    {
        try
        {
            var snapshot = await _db.Collection(COLLECTION_NAME).GetSnapshotAsync();
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
            var docRef = _db.Collection(COLLECTION_NAME).Document();
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
            await _db.Collection(COLLECTION_NAME).Document(id).DeleteAsync();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting announcement: {ex.Message}");
            throw;
        }
    }
}