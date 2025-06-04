using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.Settings;

/// <summary>
/// Configuration settings for AI Services (Gemini and OpenAI)
/// </summary>
public class AISettings
{
    /// <summary>
    /// Section name in appsettings.json
    /// </summary>
    public const string SectionName = "AI";

    // OpenAI Specific Settings (primarily for Audio)
    /// <summary>
    /// API key for OpenAI (used for audio services)
    /// </summary>
    [Required(ErrorMessage = "OpenAI API key is required for audio services.")]
    public string OpenAIApiKey { get; set; } = string.Empty; // Changed from ApiKey

    /// <summary>
    /// The model to use for OpenAI text-to-speech (e.g., "tts-1")
    /// </summary>
    [Required]
    public string OpenAIAudioModelName { get; set; } = "tts-1"; // Default OpenAI TTS model

    /// <summary>
    /// Base URL for OpenAI API
    /// </summary>
    [Required]
    public string OpenAIApiBaseUrl { get; set; } = "https://api.openai.com";

    /// <summary>
    /// Default voice to use for OpenAI text-to-speech
    /// </summary>
    [Required]
    public string DefaultVoice { get; set; } = "alloy";

    // OpenAI Image Generation Settings
    /// <summary>
    /// Model to use for OpenAI image generation (e.g., "gpt-image-1").
    /// </summary>
    [Required]
    public string OpenAIImageModelName { get; set; } = "gpt-image-1";

    /// <summary>
    /// Size of the generated images (e.g., "1024x1024", "1792x1024", "1024x1792" for AI).
    /// </summary>
    [Required]
    public string OpenAIImageSize { get; set; } = "1024x1024";

    /// <summary>
    /// Quality of the generated images (e.g., "standard", "hd" for AI).
    /// </summary>
    [Required]
    public string OpenAIImageQuality { get; set; } = "low";

    // Gemini Specific Settings
    /// <summary>
    /// API key for Google Gemini
    /// </summary>
    [Required(ErrorMessage = "Gemini API key is required")]
    public string GeminiApiKey { get; set; } = string.Empty;

    /// <summary>
    /// The model to use for Gemini text generation (used for all text generation tasks)
    /// </summary>
    [Required]
    public string GeminiTextModelName { get; set; } = "gemini-2.5-flash-preview-05-20";

    /// <summary>
    /// Base URL for Gemini API
    /// </summary>
    [Required]
    public string GeminiApiBaseUrl { get; set; } = "https://generativelanguage.googleapis.com";

    /// <summary>
    /// API Version for Gemini (e.g., "v1beta")
    /// </summary>
    [Required]
    public string GeminiApiVersion { get; set; } = "v1beta";

    // General Settings
    /// <summary>
    /// Maximum number of tokens to generate in the chat completion.
    /// This corresponds to 'maxOutputTokens' in Gemini.
    /// </summary>
    [Range(1, 8192, ErrorMessage = "Token count must be between 1 and 8192 for current Gemini models.")] // Adjusted range to be more generic, actual limit depends on specific model
    public int MaxTokens { get; set; } = 8192;

    /// <summary>
    /// Default temperature for Gemini generation. Controls randomness. Lower is more deterministic.
    /// </summary>
    [Range(0.0, 2.0, ErrorMessage = "Temperature must be between 0.0 and 2.0 for Gemini.")] // Gemini typical range
    public float DefaultTemperature { get; set; } = 0.7f;

    /// <summary>
    /// Default Top-P for Gemini generation. Nucleus sampling parameter.
    /// </summary>
    [Range(0.0, 1.0, ErrorMessage = "TopP must be between 0.0 and 1.0.")]
    public float DefaultTopP { get; set; } = 0.9f;

    /// <summary>
    /// System message to guide the AI's responses.
    /// For Gemini, this will typically be part of the initial "contents" in the chat.
    /// </summary>
    public string SystemMessage { get; set; } = "You are a helpful assistant for a Lithuanian language learning app called Lithuaningo. Only answer questions related to Lithuanian language learning, grammar, vocabulary, culture, or using the Lithuaningo app.";

    /// <summary>
    /// Default timeout in seconds for HTTP requests to AI services.
    /// </summary>
    [Range(5, 300, ErrorMessage = "Timeout must be between 5 and 300 seconds.")]
    public int TimeoutSeconds { get; set; } = 100; // Default timeout
}