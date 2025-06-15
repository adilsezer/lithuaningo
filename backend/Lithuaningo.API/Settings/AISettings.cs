using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.Settings;

/// <summary>
/// Configuration settings for AI services (OpenAI)
/// </summary>
public class AISettings
{
    /// <summary>
    /// The name of the configuration section
    /// </summary>
    public const string SectionName = "AI";

    /// <summary>
    /// The API key for OpenAI services
    /// </summary>
    [Required(ErrorMessage = "OpenAI API key is required.")]
    public string OpenAIApiKey { get; set; } = string.Empty;

    /// <summary>
    /// The base URL for the OpenAI API
    /// </summary>
    [Required]
    public string OpenAIApiBaseUrl { get; set; } = "https://api.openai.com";

    /// <summary>
    /// The model name for text generation (e.g., gpt-4o)
    /// </summary>
    [Required]
    public string OpenAITextModelName { get; set; } = "o3-2025-04-16";

    /// <summary>
    /// The model name for image generation (e.g., dall-e-3)
    /// </summary>
    [Required]
    public string OpenAIImageModelName { get; set; } = "gpt-image-1";

    /// <summary>
    /// The size of the generated images (e.g., "1024x1024")
    /// </summary>
    [Required]
    public string OpenAIImageSize { get; set; } = "1024x1024";

    /// <summary>
    /// The quality of the generated images (e.g., "standard" or "hd")
    /// </summary>
    [Required]
    public string OpenAIImageQuality { get; set; } = "low";

    /// <summary>
    /// The model name for audio generation (e.g., tts-1)
    /// </summary>
    [Required]
    public string OpenAIAudioModelName { get; set; } = "tts-1";

    /// <summary>
    /// The default voice for text-to-speech
    /// </summary>
    public string DefaultVoice { get; set; } = "alloy";

    /// <summary>
    /// Default maximum number of tokens to generate in a response.
    /// </summary>
    [Range(1, 8192, ErrorMessage = "Token count must be between 1 and 8192.")]
    public int MaxTokens { get; set; } = 8192;

    /// <summary>
    /// Default temperature for controlling randomness in generation.
    /// </summary>
    [Range(0.0, 2.0, ErrorMessage = "Temperature must be between 0.0 and 2.0.")]
    public double DefaultTemperature { get; set; } = 0.7;

    /// <summary>
    /// Default TopP for controlling nucleus sampling.
    /// </summary>
    [Range(0.0, 1.0, ErrorMessage = "TopP must be between 0.0 and 1.0.")]
    public double DefaultTopP { get; set; } = 0.9;


    /// <summary>
    /// Request timeout in seconds
    /// </summary>
    [Range(5, 300, ErrorMessage = "Timeout must be between 5 and 300 seconds.")]
    public int RequestTimeoutSeconds { get; set; } = 120;
}