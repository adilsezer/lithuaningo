using Microsoft.AspNetCore.Mvc;
using Services.Announcements;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lithuaningo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementController : ControllerBase
    {
        private readonly IAnnouncementService _announcementService;

        public AnnouncementController(IAnnouncementService announcementService)
        {
            _announcementService = announcementService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Announcement>>> GetAnnouncements()
        {
            var announcements = await _announcementService.GetAnnouncementsAsync();
            return Ok(announcements);
        }
    }
}
