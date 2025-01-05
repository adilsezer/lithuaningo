using Lithuaningo.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Interfaces;

public interface IAnnouncementService
{
    /// <summary>
    /// Retrieves all active announcements
    /// </summary>
    /// <returns>A list of announcements</returns>
    Task<IEnumerable<Announcement>> GetAnnouncementsAsync();

    /// <summary>
    /// Creates a new announcement
    /// </summary>
    /// <param name="announcement">The announcement to create</param>
    Task CreateAnnouncementAsync(Announcement announcement);

    /// <summary>
    /// Deletes an announcement by its ID
    /// </summary>
    /// <param name="id">The ID of the announcement to delete</param>
    Task DeleteAnnouncementAsync(string id);
}