using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    public UserController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUserProfile(string userId)
    {
        var userProfile = await _userService.GetUserProfileAsync(userId);
        return userProfile != null ? Ok(userProfile) : NotFound();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateUserProfile([FromBody] UserProfile userProfile)
    {
        await _userService.UpdateUserProfileAsync(userProfile);
        return NoContent();
    }
}