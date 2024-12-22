using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
    }

    [HttpGet("{userId}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserProfile))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfile>> GetUserProfile(string userId)
    {
        if (string.IsNullOrEmpty(userId))
            return BadRequest("UserId cannot be empty.");

        var userProfile = await _userService.GetUserProfileAsync(userId);
        return userProfile != null ? Ok(userProfile) : NotFound();
    }

    [HttpPut]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UpdateUserProfile([FromBody] UserProfile userProfile)
    {
        if (userProfile == null)
            return BadRequest("User profile cannot be null.");

        await _userService.UpdateUserProfileAsync(userProfile);
        return NoContent();
    }
}