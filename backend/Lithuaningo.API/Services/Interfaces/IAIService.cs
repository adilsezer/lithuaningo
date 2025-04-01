using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces;

/// <summary>
/// Interface for handling AI interactions with OpenAI, providing functionality for chat, flashcard generation, and challenge creation.
/// </summary>
public interface IAIService
{
    /// <summary>
    /// Gets the name of the AI service provider
    /// </summary>
    /// <returns>The name of the AI service (e.g., "OpenAI")</returns>
    string GetServiceName();
    
    /// <summary>
    /// Gets the name of the AI model being used
    /// </summary>
    /// <returns>The name of the AI model (e.g., "gpt-4", "gpt-3.5-turbo")</returns>
    string GetModelName();
    
    /// <summary>
    /// Processes a chat request and returns a response from the AI
    /// </summary>
    /// <param name="prompt">The text prompt to send to the AI</param>
    /// <param name="context">Optional context parameters for the request, including session management</param>
    /// <param name="serviceType">The type of AI service to use (currently only supports "chat")</param>
    /// <returns>The AI's response text</returns>
    /// <exception cref="Exception">Thrown when there's an error processing the request</exception>
    Task<string> ProcessRequestAsync(string prompt, Dictionary<string, string>? context = null, string serviceType = "chat");
    
    /// <summary>
    /// Generates a set of challenge questions using AI based on the provided parameters
    /// </summary>
    /// <param name="request">The parameters for challenge generation, including topic and difficulty</param>
    /// <returns>A list of challenge questions with multiple choice, true/false, and fill-in-blank options</returns>
    /// <exception cref="ArgumentNullException">Thrown when request is null</exception>
    /// <exception cref="InvalidOperationException">Thrown when AI response is invalid or validation fails</exception>
    Task<List<ChallengeQuestionResponse>> GenerateChallengesAsync(CreateChallengeRequest request);
    
    /// <summary>
    /// Generates a set of flashcards using AI based on the provided parameters
    /// </summary>
    /// <param name="request">The parameters for flashcard generation, including primary category and difficulty</param>
    /// <param name="existingWords">Optional existing words to avoid in the generated flashcards</param>
    /// <returns>A list of generated flashcards</returns>
    /// <exception cref="ArgumentNullException">Thrown when request is null</exception>
    /// <exception cref="InvalidOperationException">Thrown when AI response is invalid or empty</exception>
    Task<List<Flashcard>> GenerateFlashcardsAsync(FlashcardRequest request, IEnumerable<string>? existingWords = null);
    
    /// <summary>
    /// Clears the conversation history for testing or session management purposes
    /// </summary>
    /// <param name="sessionId">Optional specific session ID to clear. If null, clears all conversation histories</param>
    void ClearConversationHistory(string? sessionId = null);

    /// <summary>
    /// Generates an image using DALL-E based on the provided prompt
    /// </summary>
    /// <param name="flashcardWord">The Lithuanian word to illustrate</param>
    /// <returns>URL to the generated image stored in Cloudflare R2</returns>
    /// <exception cref="ArgumentNullException">Thrown when flashcardWord is null or empty</exception>
    /// <exception cref="InvalidOperationException">Thrown when image generation fails</exception>
    Task<string> GenerateImageAsync(string flashcardWord);
    
    /// <summary>
    /// Generates audio using OpenAI's text-to-speech service
    /// </summary>
    /// <param name="flashcardWord">The Lithuanian word to convert to speech</param>
    /// <returns>URL to the generated audio file stored in cloud storage</returns>
    /// <exception cref="ArgumentNullException">Thrown when flashcardWord is null or empty</exception>
    /// <exception cref="InvalidOperationException">Thrown when audio generation fails</exception>
    Task<string> GenerateAudioAsync(string flashcardWord);
} 