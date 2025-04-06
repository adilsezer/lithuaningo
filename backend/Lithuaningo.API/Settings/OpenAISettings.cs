using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.Settings;

/// <summary>
/// Configuration settings for OpenAI API
/// </summary>
public class OpenAISettings
{
    /// <summary>
    /// Section name in appsettings.json
    /// </summary>
    public const string SectionName = "OpenAI";

    /// <summary>
    /// API key for OpenAI
    /// </summary>
    [Required(ErrorMessage = "OpenAI API key is required")]
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// The model to use for chat completions
    /// </summary>
    [Required]
    public string ChatModelName { get; set; } = "gpt-4o-mini";

    /// <summary>
    /// The model to use for image generation (e.g., "dall-e-3")
    /// </summary>
    [Required]
    public string ImageModelName { get; set; } = "dall-e-3";

    /// <summary>
    /// Default image size for DALL-E generation
    /// </summary>
    [Required]
    [RegularExpression(@"^\d+x\d+$", ErrorMessage = "Image size must be in format WIDTHxHEIGHT (e.g., 1024x1024)")]
    public string DefaultImageSize { get; set; } = "1024x1024";

    /// <summary>
    /// The quality of the image to generate
    /// </summary>
    [Required]
    public string ImageQuality { get; set; } = "standard";

    /// <summary>
    /// The model to use for text-to-speech (e.g., "tts-1")
    /// </summary>
    [Required]
    public string AudioModelName { get; set; } = "gpt-4o-mini-tts";

    /// <summary>
    /// Default voice to use for text-to-speech
    /// </summary>
    [Required]
    public string DefaultVoice { get; set; } = "alloy";

    /// <summary>
    /// Maximum number of tokens to generate in the chat completion
    /// </summary>
    [Range(1, 4096, ErrorMessage = "Token count must be between 1 and 4096")]
    public int MaxTokens { get; set; } = 200;

    /// <summary>
    /// System message to guide the AI's responses
    /// </summary>
    public string SystemMessage { get; set; } = "You are a helpful assistant for a Lithuanian language learning app called Lithuaningo. Only answer questions related to Lithuanian language learning, grammar, vocabulary, culture, or using the Lithuaningo app.";
}