using Lithuaningo.API.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lithuaningo.API.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Microsoft.AspNetCore.Mvc.IgnoreAntiforgeryToken]
public abstract class BaseApiController : ControllerBase
{
} 