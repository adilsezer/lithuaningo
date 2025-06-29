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
    /// The model name for text generation (e.g., gpt-4o)
    /// </summary>
    [Required]
    public string OpenAITextModelName { get; set; } = "o4-mini-2025-04-16";

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
    /// Maximum tokens for chat responses
    /// </summary>
    [Range(1, 128000, ErrorMessage = "Chat token count must be between 1 and 128000.")]
    public int ChatMaxTokens { get; set; } = 2048;

    /// <summary>
    /// Maximum tokens for flashcard generation
    /// </summary>
    [Range(1, 128000, ErrorMessage = "Flashcard token count must be between 1 and 128000.")]
    public int FlashcardGenerationMaxTokens { get; set; } = 8192;

    /// <summary>
    /// Maximum tokens for challenge generation
    /// </summary>
    [Range(1, 128000, ErrorMessage = "Challenge token count must be between 1 and 128000.")]
    public int ChallengeGenerationMaxTokens { get; set; } = 8192;
}