using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace Lithuaningo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppInfoController : ControllerBase
    {
        private readonly IAppInfoService _appInfoService;

        public AppInfoController(IAppInfoService appInfoService)
        {
            _appInfoService = appInfoService;
        }

        [HttpGet("{platform}")]
        public async Task<ActionResult<AppInfo>> GetAppInfo(string platform)
        {
            var appInfo = await _appInfoService.GetAppInfoAsync(platform);
            return Ok(appInfo);
        }
    }
}
