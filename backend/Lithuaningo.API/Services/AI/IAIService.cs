using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.AI;

/// <summary>
/// Interface for handling AI interactions with configured providers (e.g., Gemini, OpenAI),
/// providing functionality for chat, flashcard generation, image generation, audio generation, and challenge creation.
/// </summary>
public interface IAIService
{
    /// <summary>
    /// Gets the name of the primary AI service provider or a composite name.
    /// </summary>
    /// <returns>The name of the AI service (e.g., "Gemini/OpenAI")</returns>
    string GetServiceName();

    /// <summary>
    /// Gets the name of the primary AI model being used (typically for text generation).
    /// </summary>
    /// <returns>The name of the AI model (e.g., "gemini-1.5-flash", "gpt-4")</returns>
    string GetModelName();

    /// <summary>
    /// Processes a chat request and returns a response from the AI
    /// </summary>
    /// <param name="prompt">The text prompt to send to the AI</param>
    /// <param name="context">Optional context parameters for the request, including session management</param>
    /// <returns>The AI's response text</returns>
    /// <exception cref="Exception">Thrown when there's an error processing the request</exception>
    Task<string> GenerateChatResponseAsync(string prompt, Dictionary<string, string>? context = null);

    /// <summary>
    /// Generates a set of flashcards using AI based on the provided parameters
    /// </summary>
    /// <param name="request">The parameters for flashcard generation, including primary category and difficulty</param>
    /// <param name="existingFrontTexts">Optional existing front texts to avoid in the generated flashcards</param>
    /// <returns>A list of generated flashcards</returns>
    /// <exception cref="ArgumentNullException">Thrown when request is null</exception>
    /// <exception cref="InvalidOperationException">Thrown when AI response is invalid or empty</exception>
    Task<List<Flashcard>> GenerateFlashcardsAsync(FlashcardRequest request, IEnumerable<string>? existingFrontTexts = null);

    /// <summary>
    /// Clears the conversation history for testing or session management purposes
    /// </summary>
    /// <param name="sessionId">Optional specific session ID to clear. If null, clears all conversation histories</param>
    void ClearConversationHistory(string? sessionId = null);

    /// <summary>
    /// Generates an image using the configured AI image generation service (e.g., OpenAI) and uploads it to storage.
    /// </summary>
    /// <param name="flashcardFrontText">The Lithuanian front text of the flashcard (primary subject for the image).</param>
    /// <param name="exampleSentenceTranslation">The English translation of the example sentence for contextual understanding.</param>
    /// <returns>The public URL of the uploaded image.</returns>
    /// <exception cref="ArgumentNullException">Thrown when flashcardFrontText or exampleSentenceTranslation is null or empty.</exception>
    /// <exception cref="InvalidOperationException">Thrown when image generation or upload fails.</exception>
    Task<string> GenerateImageAsync(string flashcardFrontText, string exampleSentenceTranslation);

    /// <summary>
    /// Generates audio using the configured AI text-to-speech service (e.g., OpenAI) based on the provided text.
    /// </summary>
    /// <param name="flashcardFrontText">The Lithuanian front text to convert to speech</param>
    /// <param name="exampleSentence">Optional example sentence to include after the front text</param>
    /// <returns>URL to the generated audio file stored in cloud storage</returns>
    /// <exception cref="ArgumentNullException">Thrown when flashcardFrontText is null or empty</exception>
    /// <exception cref="InvalidOperationException">Thrown when audio generation fails</exception>
    Task<string> GenerateAudioAsync(string flashcardFrontText, string exampleSentence);

    /// <summary>
    /// Generates challenge questions for a single flashcard.
    /// </summary>
    /// <param name="flashcard">The flashcard to generate challenges for.</param>
    /// <returns>A list of the generated challenge question DTOs.</returns>
    /// <exception cref="ArgumentNullException">Thrown when flashcard is null.</exception>
    /// <exception cref="InvalidOperationException">Thrown when AI response is invalid or validation fails.</exception>
    Task<List<ChallengeQuestionResponse>> GenerateChallengesForFlashcardAsync(Flashcard flashcard);
}