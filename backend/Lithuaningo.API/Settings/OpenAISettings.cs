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
    public string ApiKey { get; set; } = string.Empty;
    
    /// <summary>
    /// The model to use for chat completions
    /// </summary>
    public string ChatModelName { get; set; } = "gpt-4o-mini";
    
    /// <summary>
    /// The model to use for image generation (e.g., "dall-e-3")
    /// </summary>
    public string ImageModelName { get; set; } = "dall-e-3";
    
    /// <summary>
    /// Default image size for DALL-E generation
    /// </summary>
    public string DefaultImageSize { get; set; } = "1024x1024";

    /// <summary>
    /// The quality of the image to generate
    /// </summary>
    public string ImageQuality { get; set; } = "standard";
    
    /// <summary>
    /// Maximum number of tokens to generate in the chat completion
    /// </summary>
    public int MaxTokens { get; set; } = 200;
    
    /// <summary>
    /// System message to guide the AI's responses
    /// </summary>
    public string SystemMessage { get; set; } = "You are a helpful assistant for a Lithuanian language learning app called Lithuaningo. " +
        "Only answer questions related to Lithuanian language learning, grammar, vocabulary, culture, or using the Lithuaningo app. " +
        "For any questions outside of these topics, politely explain that you're focused on helping users learn Lithuanian.";
} 