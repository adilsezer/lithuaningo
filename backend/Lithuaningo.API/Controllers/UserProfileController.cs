using Lithuaningo.API.Authorization;
using Lithuaningo.API.DTOs.UserProfile;
using Lithuaningo.API.Services.UserProfile;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages user profile operations including creation, retrieval, update, and deletion.
    /// </summary>
    /// <remarks>
    /// This controller handles:
    /// - User profile creation and updates
    /// - Profile preferences management
    /// - Learning progress tracking
    /// - Login history tracking
    /// </remarks>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("User profile management endpoints")]
    public class UserProfileController : BaseApiController
    {
        private readonly IUserProfileService _userProfileService;
        private readonly ILogger<UserProfileController> _logger;

        public UserProfileController(
            IUserProfileService userProfileService,
            ILogger<UserProfileController> logger)
        {
            _userProfileService = userProfileService ?? throw new ArgumentNullException(nameof(userProfileService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves a user profile by ID.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/UserProfile/{id}
        /// 
        /// Returns user profile information including:
        /// - Basic user details
        /// - Learning preferences
        /// - Progress statistics
        /// - Achievement data
        /// </remarks>
        /// <param name="id">The user identifier</param>
        /// <returns>The user profile</returns>
        /// <response code="200">Returns the user profile</response>
        /// <response code="400">If id format is invalid</response>
        /// <response code="404">If profile is not found</response>
        /// <response code="500">If there was an internal error</response>
        [HttpGet("{id}")]
        [SwaggerOperation(
            Summary = "Retrieves user profile",
            Description = "Gets a user profile by its unique identifier",
            OperationId = "GetUserProfile",
            Tags = new[] { "UserProfile" }
        )]
        [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserProfileResponse>> GetUserProfile(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("User ID parameter is empty");
                return BadRequest("User ID cannot be empty");
            }

            try
            {
                var profile = await _userProfileService.GetUserProfileAsync(id);
                if (profile == null)
                {
                    _logger.LogInformation("User profile not found for ID {UserId}", id);
                    return NotFound();
                }

                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile for ID {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates an existing user profile.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     PUT /api/v1/UserProfile/{id}
        ///     {
        ///         "email": "updated@example.com",
        ///         "fullName": "Updated Name",
        ///         "avatarUrl": "https://example.com/new-avatar.jpg"
        ///     }
        /// </remarks>
        /// <param name="id">The user identifier</param>
        /// <param name="request">The profile update request</param>
        /// <returns>The updated user profile</returns>
        /// <response code="200">Returns the updated profile</response>
        /// <response code="400">If request model is invalid</response>
        /// <response code="404">If profile is not found</response>
        /// <response code="500">If there was an internal error</response>
        [HttpPut("{id}")]
        [SwaggerOperation(
            Summary = "Updates user profile",
            Description = "Updates an existing user profile with the specified changes",
            OperationId = "UpdateUserProfile",
            Tags = new[] { "UserProfile" }
        )]
        [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserProfileResponse>> UpdateUserProfile(string id, [FromBody] UpdateUserProfileRequest request)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("User ID parameter is empty");
                return BadRequest("User ID cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var profile = await _userProfileService.UpdateUserProfileAsync(id, request);
                return Ok(profile);
            }
            catch (KeyNotFoundException)
            {
                _logger.LogInformation("User profile not found for ID {UserId}", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile for ID {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deletes a user profile.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     DELETE /api/v1/UserProfile/{id}
        /// </remarks>
        /// <param name="id">The user identifier</param>
        /// <returns>No content</returns>
        /// <response code="200">Profile successfully deleted</response>
        /// <response code="400">If id format is invalid</response>
        /// <response code="404">If profile is not found</response>
        /// <response code="500">If there was an internal error</response>
        [HttpDelete("{id}")]
        [SwaggerOperation(
            Summary = "Deletes user profile",
            Description = "Permanently removes a user profile",
            OperationId = "DeleteUserProfile",
            Tags = new[] { "UserProfile" }
        )]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteUserProfile(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("User ID parameter is empty");
                return BadRequest("User ID cannot be empty");
            }

            try
            {
                var result = await _userProfileService.DeleteUserProfileAsync(id);
                if (!result)
                {
                    _logger.LogInformation("User profile not found for ID {UserId}", id);
                    return NotFound();
                }

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user profile for ID {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
