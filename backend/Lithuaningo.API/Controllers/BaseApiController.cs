using Lithuaningo.API.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lithuaningo.API.Controllers;

[ApiController]
[Route("api/[controller]")] // Unversioned route
[Route("api/v{version:apiVersion}/[controller]")] // Versioned route
[Authorize]
public abstract class BaseApiController : ControllerBase
{
}