using Lithuaningo.API.Authorization;
using Lithuaningo.API.DTOs.AI;
using Lithuaningo.API.Services.AI;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers;

/// <summary>
/// Controller for AI services including chat, translation, grammar checking, and other AI capabilities
/// </summary>
[ApiVersion("1.0")]
public class AIController : BaseApiController
{
    private readonly IAIService _aiService;
    private readonly ILogger<AIController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AIController"/> class.
    /// </summary>
    /// <param name="aiService">The AI service</param>
    /// <param name="logger">The logger</param>
    public AIController(IAIService aiService, ILogger<AIController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    /// <summary>
    /// Processes an AI request
    /// </summary>
    /// <param name="request">The AI request</param>
    /// <returns>The AI's response</returns>
    [HttpPost("process")]
    [Authorize]
    [SwaggerOperation(
        Summary = "Process an AI request",
        Description = "Sends a request to the AI service and returns the response. Currently, this endpoint primarily supports 'chat' service type.",
        OperationId = "AI.Process",
        Tags = new[] { "AI" }
    )]
    [ProducesResponseType(typeof(AIResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AIResponse>> ProcessRequest([FromBody] AIRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                return BadRequest("Prompt cannot be empty.");
            }

            string serviceType = request.ServiceType;
            if (string.IsNullOrWhiteSpace(serviceType))
            {
                serviceType = "chat"; // Default to chat
            }
            serviceType = serviceType.ToLowerInvariant();

            string responseText;
            if (serviceType == "chat")
            {
                // IAIService has GenerateChatResponseAsync(string prompt, Dictionary<string, string>? context)
                responseText = await _aiService.GenerateChatResponseAsync(request.Prompt, request.Context as Dictionary<string, string>);
            }
            else
            {
                _logger.LogWarning("ProcessRequest called with unsupported service type");
                return BadRequest("The specified service type is not supported by this endpoint.");
            }

            // Return the response
            return Ok(new AIResponse
            {
                Response = responseText,
                ServiceType = serviceType, // Reflect the processed service type
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AI request");
            return StatusCode(StatusCodes.Status500InternalServerError,
                "An error occurred processing your request.");
        }
    }

    /// <summary>
    /// Sends a message to the AI assistant
    /// </summary>
    /// <param name="request">The chat request</param>
    /// <returns>The AI's response</returns>
    [HttpPost("chat")]
    [Authorize]
    [SwaggerOperation(
        Summary = "Send a message to the AI assistant",
        Description = "Sends a message to the AI assistant and returns the response",
        OperationId = "AI.Chat",
        Tags = new[] { "AI" }
    )]
    [ProducesResponseType(typeof(AIResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AIResponse>> SendChatMessage([FromBody] AIRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                return BadRequest("Prompt cannot be empty.");
            }

            // IAIService has GenerateChatResponseAsync(string prompt, Dictionary<string, string>? context)
            var responseText = await _aiService.GenerateChatResponseAsync(request.Prompt, request.Context as Dictionary<string, string>);

            return Ok(new AIResponse
            {
                Response = responseText,
                ServiceType = "chat", // Explicitly set service type for chat endpoint
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AI chat message");
            return StatusCode(StatusCodes.Status500InternalServerError,
                "An error occurred processing your chat message.");
        }
    }

    /// <summary>
    /// Gets an AI explanation for a challenge question and its answer
    /// </summary>
    /// <param name="request">The question explanation request</param>
    /// <returns>A brief explanation about the question and answer</returns>
    [HttpPost("explain-question")]
    [Authorize]
    [SwaggerOperation(
        Summary = "Get AI explanation for a challenge question",
        Description = "Provides a brief educational explanation about a challenge question and its answer for premium users",
        OperationId = "AI.ExplainQuestion",
        Tags = new[] { "AI" }
    )]
    [ProducesResponseType(typeof(AIResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AIResponse>> ExplainQuestion([FromBody] QuestionExplanationRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest("Question cannot be empty.");
            }
            if (string.IsNullOrWhiteSpace(request.CorrectAnswer))
            {
                return BadRequest("Correct answer cannot be empty.");
            }
            if (string.IsNullOrWhiteSpace(request.UserAnswer))
            {
                return BadRequest("User answer cannot be empty.");
            }
            if (request.Options == null || request.Options.Count == 0)
            {
                return BadRequest("Options cannot be empty.");
            }

            var explanation = await _aiService.GenerateQuestionExplanationAsync(request);

            return Ok(new AIResponse
            {
                Response = explanation,
                ServiceType = "question-explanation",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating question explanation");
            return StatusCode(StatusCodes.Status500InternalServerError,
                "An error occurred while generating the explanation.");
        }
    }
}