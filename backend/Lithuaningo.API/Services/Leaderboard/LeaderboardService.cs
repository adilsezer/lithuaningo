using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;
using System.Globalization;

namespace Lithuaningo.API.Services;

public class LeaderboardService : ILeaderboardService
{
    private readonly FirestoreDb _db;
    private readonly string _collectionName;

    public LeaderboardService(FirestoreDb db, IOptions<FirestoreCollectionSettings> collectionSettings)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _collectionName = collectionSettings.Value.Leaderboards;
    }

    private string GetCurrentWeekId()
    {
        var currentDate = DateTime.UtcNow;
        var calendar = CultureInfo.InvariantCulture.Calendar;
        var weekNumber = calendar.GetWeekOfYear(currentDate, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        return $"{currentDate.Year}-{weekNumber:D2}";
    }

    private (DateTime startDate, DateTime endDate) GetWeekDates(string weekId)
    {
        if (string.IsNullOrEmpty(weekId))
            throw new ArgumentException("Week ID cannot be empty", nameof(weekId));

        var parts = weekId.Split('-');
        if (parts.Length != 2)
            throw new ArgumentException("Week ID must be in format YYYY-WW", nameof(weekId));

        if (!int.TryParse(parts[0], out var year))
            throw new ArgumentException("Invalid year format", nameof(weekId));

        if (!int.TryParse(parts[1], out var week))
            throw new ArgumentException("Invalid week format", nameof(weekId));

        if (week < 1 || week > 53)
            throw new ArgumentException("Week number must be between 1 and 53", nameof(weekId));

        // Create a date in the specified week
        var jan1 = new DateTime(year, 1, 1);
        var daysOffset = DayOfWeek.Thursday - jan1.DayOfWeek;
        
        // Find Thursday of week 1
        var firstThursday = jan1.AddDays(daysOffset);
        var cal = CultureInfo.InvariantCulture.Calendar;
        var firstWeek = cal.GetWeekOfYear(firstThursday, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        
        // Calculate the start date for the specified week
        var weekStart = firstThursday.AddDays(-(int)firstThursday.DayOfWeek + (int)DayOfWeek.Monday); // Go to Monday
        weekStart = weekStart.AddDays((week - firstWeek) * 7); // Go to the specified week
        var weekEnd = weekStart.AddDays(6); // Go to Sunday

        return (weekStart.Date, weekEnd.Date.AddHours(23).AddMinutes(59).AddSeconds(59));
    }

    public async Task<LeaderboardWeek> GetCurrentWeekLeaderboardAsync()
    {
        var weekId = GetCurrentWeekId();
        return await GetWeekLeaderboardAsync(weekId);
    }

    public async Task<LeaderboardWeek> GetWeekLeaderboardAsync(string weekId)
    {
        try
        {
            var docRef = _db.Collection(_collectionName).Document(weekId);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
            {
                var (startDate, endDate) = GetWeekDates(weekId);
                var newLeaderboard = new LeaderboardWeek
                {
                    Id = weekId,
                    StartDate = startDate.ToUniversalTime(),
                    EndDate = endDate.ToUniversalTime(),
                    Entries = new Dictionary<string, LeaderboardEntry>()
                };

                await docRef.SetAsync(newLeaderboard);
                return newLeaderboard;
            }

            var leaderboard = snapshot.ConvertTo<LeaderboardWeek>();
            return leaderboard;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error getting week leaderboard: {ex.Message}");
            throw;
        }
    }

    public async Task UpdateLeaderboardEntryAsync(string userId, string name, int score)
    {
        try
        {
            var weekId = GetCurrentWeekId();
            var docRef = _db.Collection(_collectionName).Document(weekId);

            // Single transaction for both creating if needed and updating the entry
            await _db.RunTransactionAsync(async transaction =>
            {
                var snapshot = await transaction.GetSnapshotAsync(docRef);
                if (!snapshot.Exists)
                {
                    var (startDate, endDate) = GetWeekDates(weekId);
                    var newLeaderboard = new LeaderboardWeek
                    {
                        Id = weekId,
                        StartDate = startDate.ToUniversalTime(),
                        EndDate = endDate.ToUniversalTime(),
                        Entries = new Dictionary<string, LeaderboardEntry>()
                    };
                    transaction.Create(docRef, new Dictionary<string, object>
                    {
                        { "id", newLeaderboard.Id },
                        { "startDate", newLeaderboard.StartDate },
                        { "endDate", newLeaderboard.EndDate },
                        { "entries", newLeaderboard.Entries }
                    });
                }

                var entryPath = $"entries.{userId}";
                var now = DateTime.UtcNow;
                transaction.Update(docRef, new Dictionary<string, object>
                {
                    { $"{entryPath}.name", name },
                    { $"{entryPath}.score", score },
                    { $"{entryPath}.lastUpdated", now }
                });
            });

            // Update ranks in a separate transaction
            await _db.RunTransactionAsync(async transaction =>
            {
                var snapshot = await transaction.GetSnapshotAsync(docRef);
                var leaderboard = snapshot.ConvertTo<LeaderboardWeek>();
                
                var sortedEntries = leaderboard.Entries
                    .OrderByDescending(e => e.Value.Score)
                    .ToList();
                
                var updates = new Dictionary<string, object>();
                for (int i = 0; i < sortedEntries.Count; i++)
                {
                    var entryPath = $"entries.{sortedEntries[i].Key}.rank";
                    updates[entryPath] = i + 1;
                }
                
                transaction.Update(docRef, updates);
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error updating leaderboard entry: {ex.Message}");
            throw;
        }
    }
} 