using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Announcement;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IAnnouncementService
    {
        /// <summary>
        /// Retrieves all active announcements.
        /// </summary>
        Task<IEnumerable<AnnouncementResponse>> GetAnnouncementsAsync();

        /// <summary>
        /// Retrieves an announcement by its ID.
        /// </summary>
        Task<AnnouncementResponse?> GetAnnouncementByIdAsync(string id);

        /// <summary>
        /// Creates a new announcement.
        /// </summary>
        Task<AnnouncementResponse> CreateAnnouncementAsync(CreateAnnouncementRequest request);

        /// <summary>
        /// Updates an announcement by its ID.
        /// </summary>
        Task<AnnouncementResponse> UpdateAnnouncementAsync(string id, UpdateAnnouncementRequest request);

        /// <summary>
        /// Deletes an announcement by its ID.
        /// </summary>
        Task DeleteAnnouncementAsync(string id);
    }
}
