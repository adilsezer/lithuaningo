using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Authorization;

namespace Lithuaningo.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public abstract class BaseApiController : ControllerBase
{
} 