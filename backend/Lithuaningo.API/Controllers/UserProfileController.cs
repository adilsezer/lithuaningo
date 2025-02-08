using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.DTOs.UserProfile;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using AutoMapper;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Controller for managing user profiles
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
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
            _logger = logger;
            _mapper = mapper;
        }

        // GET: api/userprofile/{id}
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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

        // POST: api/userprofile
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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

        // PUT: api/userprofile/{id}
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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

        // DELETE: api/userprofile/{id}
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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

        // POST: api/userprofile/{id}/login
        [HttpPost("{id}/login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
