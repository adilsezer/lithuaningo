using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.DTOs.UserProfile;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages user profile operations including creation, updates, preferences, and learning progress tracking.
    /// </summary>
    /// <remarks>
    /// This controller handles:
    /// - User profile creation and updates
    /// - Profile preferences management
    /// - Learning progress tracking
    /// - Login history tracking
    /// </remarks>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [SwaggerTag("User profile management endpoints")]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileService _userProfileService;
        private readonly ILogger<UserProfileController> _logger;
        private readonly IMapper _mapper;

        public UserProfileController(
            IUserProfileService userProfileService,
            ILogger<UserProfileController> logger,
            IMapper mapper)
        {
            _userProfileService = userProfileService ?? throw new ArgumentNullException(nameof(userProfileService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
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
        /// <param name="id">The unique identifier of the user profile</param>
        /// <returns>The requested user profile</returns>
        /// <response code="200">Returns the user profile</response>
        /// <response code="400">If the user ID format is invalid</response>
        /// <response code="404">If the user profile is not found</response>
        /// <response code="500">If there was an internal error during retrieval</response>
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
            if (!Guid.TryParse(id, out _))
            {
                _logger.LogWarning("Invalid user ID format: {Id}", id);
                return BadRequest("Invalid user ID format");
            }

            var user = await _userProfileService.GetUserProfileAsync(id);
            if (user is null)
            {
                return NotFound();
            }

            var response = _mapper.Map<UserProfileResponse>(user);
            return Ok(response);
        }

        /// <summary>
        /// Creates a new user profile.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/UserProfile
        ///     {
        ///         "userId": "user-guid",
        ///         "displayName": "John Doe",
        ///         "email": "john@example.com",
        ///         "preferredLanguage": "en"
        ///     }
        /// </remarks>
        /// <param name="request">The user profile creation request</param>
        /// <returns>The created user profile</returns>
        /// <response code="200">Returns the created user profile</response>
        /// <response code="400">If the request model is invalid</response>
        /// <response code="500">If there was an internal error during creation</response>
        [HttpPost]
        [SwaggerOperation(
            Summary = "Creates user profile",
            Description = "Creates a new user profile with the specified details",
            OperationId = "CreateUserProfile",
            Tags = new[] { "UserProfile" }
        )]
        [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserProfileResponse>> CreateUserProfile([FromBody] CreateUserProfileRequest request)
        {
            if (!Guid.TryParse(request.UserId, out _))
            {
                _logger.LogWarning("Invalid user ID format: {UserId}", request.UserId);
                return BadRequest("Invalid user ID format");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userProfile = _mapper.Map<UserProfile>(request);
                var createdProfile = await _userProfileService.CreateUserProfileAsync(request.UserId);
                var response = _mapper.Map<UserProfileResponse>(createdProfile);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "User profile already exists for ID {UserId}", request.UserId);
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Updates an existing user profile.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     PUT /api/v1/UserProfile/{id}
        ///     {
        ///         "displayName": "Updated Name",
        ///         "preferredLanguage": "lt",
        ///         "notificationSettings": {
        ///             "emailNotifications": true,
        ///             "pushNotifications": false
        ///         }
        ///     }
        /// </remarks>
        /// <param name="id">The unique identifier of the user profile to update</param>
        /// <param name="request">The user profile update request</param>
        /// <returns>The updated user profile</returns>
        /// <response code="200">Returns the updated user profile</response>
        /// <response code="400">If the request model is invalid</response>
        /// <response code="404">If the user profile is not found</response>
        /// <response code="500">If there was an internal error during update</response>
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
            if (!Guid.TryParse(id, out var userGuid))
            {
                _logger.LogWarning("Invalid user ID format: {Id}", id);
                return BadRequest("Invalid user ID format");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingUser = await _userProfileService.GetUserProfileAsync(id);
            if (existingUser is null)
            {
                return NotFound();
            }

            var userProfile = _mapper.Map<UserProfile>(request);
            userProfile.Id = userGuid;
            userProfile.CreatedAt = existingUser.CreatedAt;
            userProfile.LastLoginAt = existingUser.LastLoginAt;

            var updatedUser = await _userProfileService.UpdateUserProfileAsync(userProfile);
            var response = _mapper.Map<UserProfileResponse>(updatedUser);
            return Ok(response);
        }

        /// <summary>
        /// Deletes a user profile.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     DELETE /api/v1/UserProfile/{id}
        /// </remarks>
        /// <param name="id">The unique identifier of the user profile to delete</param>
        /// <response code="200">If the profile was successfully deleted</response>
        /// <response code="400">If the user ID format is invalid</response>
        /// <response code="404">If the user profile is not found</response>
        /// <response code="500">If there was an internal error during deletion</response>
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
            if (!Guid.TryParse(id, out _))
            {
                _logger.LogWarning("Invalid user ID format: {Id}", id);
                return BadRequest("Invalid user ID format");
            }

            var success = await _userProfileService.DeleteUserProfileAsync(id);
            if (!success)
            {
                return NotFound();
            }

            return Ok();
        }

        /// <summary>
        /// Updates the last login timestamp for a user profile.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/UserProfile/{id}/login
        /// </remarks>
        /// <param name="id">The unique identifier of the user profile</param>
        /// <response code="200">If the login timestamp was successfully updated</response>
        /// <response code="400">If the user ID format is invalid</response>
        /// <response code="404">If the user profile is not found</response>
        /// <response code="500">If there was an internal error during update</response>
        [HttpPost("{id}/login")]
        [SwaggerOperation(
            Summary = "Updates login timestamp",
            Description = "Updates the last login timestamp for a user profile",
            OperationId = "UpdateLastLogin",
            Tags = new[] { "UserProfile" }
        )]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> UpdateLastLogin(string id)
        {
            if (!Guid.TryParse(id, out _))
            {
                _logger.LogWarning("Invalid user ID format: {Id}", id);
                return BadRequest("Invalid user ID format");
            }

            try
            {
                await _userProfileService.UpdateLastLoginAsync(id);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "User profile not found for login update: {Id}", id);
                return NotFound(ex.Message);
            }
        }
    }
}
