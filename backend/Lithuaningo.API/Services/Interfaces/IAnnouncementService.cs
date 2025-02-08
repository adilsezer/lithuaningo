using Lithuaningo.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IAnnouncementService
    {
        /// <summary>
        /// Retrieves all active announcements.
        /// </summary>
        Task<IEnumerable<Announcement>> GetAnnouncementsAsync();

        /// <summary>
        /// Retrieves an announcement by its ID.
        /// </summary>
        Task<Announcement?> GetAnnouncementByIdAsync(string id);

        /// <summary>
        /// Creates a new announcement.
        /// </summary>
        Task CreateAnnouncementAsync(Announcement announcement);

        /// <summary>
        /// Updates an announcement by its ID.
        /// </summary>
        Task UpdateAnnouncementAsync(string id, Announcement announcement);

        /// <summary>
        /// Deletes an announcement by its ID.
        /// </summary>
        Task DeleteAnnouncementAsync(string id);
    }
}
