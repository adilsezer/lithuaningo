using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.AI;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Storage;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI;
using OpenAI.Audio;
using OpenAI.Chat;
using OpenAI.Images;

namespace Lithuaningo.API.Services.AI;

/// <summary>
/// Unified service for handling AI interactions with OpenAI
/// </summary>
public class AIService : IAIService
{



    #region Private Fields

    // Store conversation history for sessions
    private readonly ConcurrentDictionary<string, List<ChatMessage>> _conversationHistories = new();

    private readonly AISettings _aiSettings;
    private readonly ILogger<AIService> _logger;
    private readonly IStorageService _storageService;
    private readonly StorageSettings _storageSettings;
    private readonly OpenAIClient _openAIClient;
    private readonly ChatClient _chatClient;
    private readonly ImageClient _imageClient;
    private readonly AudioClient _audioClient;

    #endregion

    #region Constructor

    /// <summary>
    /// Initializes a new instance of the <see cref="AIService"/> class.
    /// </summary>
    /// <param name="aiSettingsOptions">The AI settings</param>
    /// <param name="logger">The logger</param>
    /// <param name="storageService">The storage service</param>
    /// <param name="storageSettingsOptions">The storage settings</param>
    /// <param name="openAIClient">The OpenAI client</param>
    public AIService(
        IOptions<AISettings> aiSettingsOptions,
        ILogger<AIService> logger,
        IStorageService storageService,
        IOptions<StorageSettings> storageSettingsOptions,
        OpenAIClient openAIClient)
    {
        _logger = logger;
        _aiSettings = aiSettingsOptions.Value;
        _storageSettings = storageSettingsOptions.Value;
        _storageService = storageService;
        _openAIClient = openAIClient;

        _chatClient = _openAIClient.GetChatClient(_aiSettings.OpenAITextModelName);
        _imageClient = _openAIClient.GetImageClient(_aiSettings.OpenAIImageModelName);
        _audioClient = _openAIClient.GetAudioClient(_aiSettings.OpenAIAudioModelName);

        _logger.LogInformation("AIService initialized for OpenAI.");
    }

    #endregion

    #region Public Methods

    /// <summary>
    /// Gets the service name
    /// </summary>
    /// <returns>The name of the AI service</returns>
    public string GetServiceName() => "OpenAI";

    /// <summary>
    /// Gets the model name used by this service (primary text model)
    /// </summary>
    /// <returns>The name of the AI model</returns>
    public string GetModelName() => _aiSettings.OpenAITextModelName;

    /// <summary>
    /// Processes an AI request and returns a response
    /// </summary>
    /// <param name="prompt">The text prompt to send to the AI</param>
    /// <param name="context">Optional context parameters for the request</param>
    /// <returns>The AI's response text</returns>
    public async Task<string> GenerateChatResponseAsync(string prompt, Dictionary<string, string>? context = null)
    {
        _logger.LogInformation("Processing AI chat request with OpenAI.");
        var sessionId = context?.GetValueOrDefault("sessionId") ?? "default_session";

        var conversationHistory = _conversationHistories.GetOrAdd(sessionId, _ =>
        {
            _logger.LogInformation("Creating new conversation history for session ID: {SessionId} with system message.", sessionId);
            return new List<ChatMessage> { new SystemChatMessage(AIPrompts.CHAT_SYSTEM_INSTRUCTIONS) };
        });

        conversationHistory.Add(new UserChatMessage(prompt));

        const int maxHistoryItems = 22; // 1 system message + 10 user/model pairs + 1 new user message
        if (conversationHistory.Count > maxHistoryItems)
        {
            _logger.LogWarning("Conversation history for session {SessionId} exceeds {MaxItems}. Truncating.", sessionId, maxHistoryItems);
            var oldHistory = conversationHistory.ToList();
            conversationHistory.Clear();
            conversationHistory.Add(oldHistory.First()); // Keep system message
            conversationHistory.AddRange(oldHistory.Skip(oldHistory.Count - (maxHistoryItems - 1)));
        }

        try
        {
            var chatCompletionOptions = new ChatCompletionOptions
            {
                MaxOutputTokenCount = _aiSettings.MaxTokens,
            };

            ChatCompletion completion = await _chatClient.CompleteChatAsync(conversationHistory, chatCompletionOptions);

            string aiResponseText = completion.Content[0].Text;
            conversationHistory.Add(new AssistantChatMessage(aiResponseText));
            return aiResponseText;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AI request with OpenAI.");
            throw;
        }
    }

    /// <summary>
    /// Generates an image using ai based on the provided prompt, uploads it to storage, and returns the URL.
    /// </summary>
    /// <param name="flashcardFrontText">The Lithuanian front text of the flashcard (primary subject for the image).</param>
    /// <param name="exampleSentenceTranslation">The English translation of the example sentence for contextual understanding.</param>
    /// <param name="flashcardId">The ID of the flashcard</param>
    /// <returns>The public URL of the uploaded image.</returns>
    /// <exception cref="ArgumentNullException">Thrown when flashcardFrontText is null or empty. exampleSentenceTranslation can be empty. flashcardId cannot be null or empty.</exception>
    /// <exception cref="InvalidOperationException">Thrown when image generation or upload fails.</exception>
    public async Task<string> GenerateImageAsync(string flashcardFrontText, string exampleSentenceTranslation, string flashcardId)
    {
        if (string.IsNullOrEmpty(flashcardFrontText))
        {
            _logger.LogError("Flashcard front text cannot be null or empty for image generation.");
            throw new ArgumentNullException(nameof(flashcardFrontText));
        }
        if (string.IsNullOrEmpty(exampleSentenceTranslation))
        {
            _logger.LogWarning("Example sentence translation is null or empty for image generation for flashcard: {FlashcardFrontText}. Proceeding with front text only.", flashcardFrontText);
        }

        if (string.IsNullOrEmpty(flashcardId))
        {
            _logger.LogError("flashcardId cannot be null or empty");
            throw new ArgumentNullException(nameof(flashcardId), "flashcardId cannot be null or empty");
        }

        try
        {
            string combinedPrompt = string.Format(
                AIPrompts.IMAGE_GENERATION_PROMPT,
                flashcardFrontText,
                exampleSentenceTranslation ?? string.Empty
            );

            var imageOptions = new ImageGenerationOptions
            {
                Quality = ParseImageQuality(_aiSettings.OpenAIImageQuality),
                Size = ParseImageSize(_aiSettings.OpenAIImageSize),
            };

            _logger.LogInformation("Requesting image generation from OpenAI with prompt: {Prompt}", combinedPrompt);

            var imageResult = await _imageClient.GenerateImageAsync(combinedPrompt, imageOptions);
            GeneratedImage image = imageResult.Value;

            if (image.ImageBytes == null || image.ImageBytes.ToMemory().IsEmpty)
            {
                _logger.LogError("OpenAI response did not contain image bytes.");
                throw new InvalidOperationException("OpenAI response did not contain image bytes.");
            }

            _logger.LogInformation("Uploading generated image binary data to storage");

            var uploadedUrl = await _storageService.UploadBinaryDataAsync(
                image.ImageBytes.ToArray(),
                "image/png",
                _storageSettings.Paths.Flashcards,
                _storageSettings.Paths.Images,
                ".png",
                flashcardId
            );

            if (string.IsNullOrEmpty(uploadedUrl))
            {
                _logger.LogError("Storage service returned an empty URL after uploading image binary data.");
                throw new InvalidOperationException("Storage service returned an empty URL after uploading image binary data.");
            }

            _logger.LogInformation("Successfully generated and uploaded image. URL: {UploadedUrl}", uploadedUrl);
            return uploadedUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating image with OpenAI.");
            throw new InvalidOperationException($"Error generating image with OpenAI: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Generates audio using OpenAI's text-to-speech service
    /// </summary>
    /// <param name="flashcardText">The Lithuanian text to convert to speech</param>
    /// <param name="exampleSentence">Example sentence to include after the text</param>
    /// <param name="flashcardId">The ID of the flashcard for file naming</param>
    /// <returns>URL to the generated audio file stored in cloud storage</returns>
    /// <exception cref="ArgumentNullException">Thrown when flashcardText, exampleSentence, or flashcardId is null or empty</exception>
    /// <exception cref="InvalidOperationException">Thrown when audio generation fails</exception>
    public async Task<string> GenerateAudioAsync(string flashcardText, string exampleSentence, string flashcardId)
    {
        if (string.IsNullOrEmpty(flashcardText) || string.IsNullOrEmpty(exampleSentence))
        {
            _logger.LogError("Flashcard text or example sentence cannot be null or empty");
            throw new ArgumentNullException(nameof(flashcardText), "Flashcard text or example sentence cannot be null or empty");
        }

        if (string.IsNullOrEmpty(flashcardId))
        {
            _logger.LogError("flashcardId cannot be null or empty");
            throw new ArgumentNullException(nameof(flashcardId), "flashcardId cannot be null or empty");
        }

        try
        {
            string textToSpeak = $"{flashcardText}... {exampleSentence}";

            GeneratedSpeechVoice voice = _aiSettings.DefaultVoice.ToLowerInvariant() switch
            {
                "alloy" => GeneratedSpeechVoice.Alloy,
                "echo" => GeneratedSpeechVoice.Echo,
                "fable" => GeneratedSpeechVoice.Fable,
                "onyx" => GeneratedSpeechVoice.Onyx,
                "nova" => GeneratedSpeechVoice.Nova,
                "shimmer" => GeneratedSpeechVoice.Shimmer,
                _ => GeneratedSpeechVoice.Alloy,
            };

            var speechResult = await _audioClient.GenerateSpeechAsync(textToSpeak, voice);
            BinaryData speechData = speechResult.Value;

            if (speechData == null || speechData.ToMemory().IsEmpty)
            {
                _logger.LogError("Failed to generate audio: empty response from OpenAI");
                throw new InvalidOperationException("Failed to generate audio: empty response from OpenAI");
            }

            var uploadedUrl = await _storageService.UploadBinaryDataAsync(
                speechData.ToArray(),
                "audio/mpeg",
                _storageSettings.Paths.Flashcards,
                _storageSettings.Paths.Audio,
                ".mp3",
                flashcardId
            );

            return uploadedUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating audio");
            throw new InvalidOperationException($"Error generating audio: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Generates a set of flashcards using AI based on the provided parameters
    /// </summary>
    /// <param name="request">The parameters for flashcard generation, including primary category and difficulty</param>
    /// <param name="existingFlashcardFrontTexts">Optional existing flashcard front texts to avoid in the generated flashcards</param>
    /// <returns>A list of generated flashcards</returns>
    /// <exception cref="ArgumentNullException">Thrown when request is null</exception>
    /// <exception cref="InvalidOperationException">Thrown when AI response is invalid or empty</exception>
    public async Task<List<Flashcard>> GenerateFlashcardsAsync(FlashcardRequest request, IEnumerable<string>? existingFlashcardFrontTexts = null)
    {
        _logger.LogInformation("Attempting to generate flashcards with AI for category {Category} and difficulty {Difficulty}", request.PrimaryCategory, request.Difficulty);

        return await RetryWithBackoffAsync(async attempt =>
        {
            _logger.LogInformation("Generating flashcards with AI - Attempt: {Attempt}, Category: {Category}, Difficulty: {Difficulty}", attempt, request.PrimaryCategory, request.Difficulty);
            var userPrompt = BuildFlashcardGenerationUserPrompt(request, existingFlashcardFrontTexts);

            var aiResponseText = await ExecuteOpenAIGenerationRequestAsync(
                AIPrompts.FLASHCARD_SYSTEM_INSTRUCTIONS,
                userPrompt
            );

            if (string.IsNullOrWhiteSpace(aiResponseText))
            {
                _logger.LogWarning("AI response was null or whitespace on attempt {Attempt}.", attempt);
                throw new InvalidOperationException("AI response was null or whitespace.");
            }

            try
            {
                var flashcards = JsonSerializer.Deserialize<List<Flashcard>>(aiResponseText, JsonSettings.AiOptions);
                if (flashcards == null || !flashcards.Any() || !ValidateGeneratedFlashcards(flashcards))
                {
                    _logger.LogWarning("Generated flashcards failed validation on attempt {Attempt}. Count: {FlashcardCount}", attempt, flashcards?.Count);
                    throw new InvalidOperationException("Generated flashcards failed validation.");
                }

                _logger.LogInformation("Successfully generated and validated {FlashcardCount} flashcards on attempt {Attempt}.", flashcards.Count, attempt);
                return flashcards;
            }
            catch (JsonException jsonEx)
            {
                _logger.LogError(jsonEx, "Failed to deserialize flashcards JSON on attempt {Attempt}. JSON: {JsonResponse}", attempt, aiResponseText);
                throw new InvalidOperationException("Failed to deserialize flashcards JSON", jsonEx);
            }
        });
    }

    /// <summary>
    /// Clears conversation history for testing purposes
    /// </summary>
    /// <param name="sessionId">Optional specific session ID to clear, or all if null</param>
    public void ClearConversationHistory(string? sessionId = null)
    {
        if (sessionId != null)
        {
            _conversationHistories.TryRemove(sessionId, out _);
            _logger.LogInformation("Cleared conversation history for session ID: {SessionId}", sessionId);
        }
        else
        {
            _conversationHistories.Clear();
            _logger.LogInformation("Cleared all conversation histories.");
        }
    }

    public async Task<List<ChallengeQuestionResponse>> GenerateChallengesForFlashcardAsync(Flashcard flashcard)
    {
        if (flashcard == null)
        {
            throw new ArgumentNullException(nameof(flashcard));
        }

        return await RetryWithBackoffAsync(async (attempt) =>
        {
            _logger.LogInformation("Attempting to generate challenges for flashcard ID: {FlashcardId} - Attempt {Attempt}", flashcard.Id, attempt);

            var flashcardJson = JsonSerializer.Serialize(new
            {
                frontText = flashcard.FrontText,
                backText = flashcard.BackText,
                exampleSentence = flashcard.ExampleSentence,
                exampleSentenceTranslation = flashcard.ExampleSentenceTranslation,
                difficulty = (int)flashcard.Difficulty,
                categories = flashcard.Categories
            }, JsonSettings.AiOptions);

            var userPrompt = $"Generate challenges for the following flashcard:\n{flashcardJson}";

            var extractedJson = await ExecuteOpenAIGenerationRequestAsync(
                AIPrompts.FLASHCARD_CHALLENGE_GENERATION_SYSTEM_INSTRUCTIONS,
                userPrompt
            );

            try
            {
                var challengeResponses = JsonSerializer.Deserialize<List<ChallengeQuestionResponse>>(extractedJson, JsonSettings.AiOptions);
                if (challengeResponses == null || !challengeResponses.Any() || !ValidateGeneratedChallenges(challengeResponses))
                {
                    _logger.LogWarning("Generated challenges for flashcard {FlashcardId} on attempt {Attempt} are null, empty, or invalid. JSON: {ExtractedJson}", flashcard.Id, attempt, extractedJson);
                    throw new InvalidOperationException("AI generated invalid or empty challenge questions for flashcard.");
                }
                _logger.LogInformation("Successfully generated {Count} challenges for flashcard ID: {FlashcardId} on attempt {Attempt}", challengeResponses.Count, flashcard.Id, attempt);
                return challengeResponses;
            }
            catch (JsonException jsonEx)
            {
                _logger.LogError(jsonEx, "Error deserializing challenge questions JSON for flashcard {FlashcardId} on attempt {Attempt}. Extracted JSON: {ExtractedJson}", flashcard.Id, attempt, extractedJson);
                throw new InvalidOperationException("Failed to deserialize AI-generated challenge questions for flashcard.", jsonEx);
            }
        });
    }

    /// <summary>
    /// Generates a brief explanation about a challenge question and its answer for educational purposes
    /// </summary>
    public async Task<string> GenerateQuestionExplanationAsync(QuestionExplanationRequest request)
    {
        if (request == null)
        {
            throw new ArgumentNullException(nameof(request));
        }
        if (string.IsNullOrWhiteSpace(request.Question))
        {
            throw new ArgumentNullException(nameof(request.Question));
        }
        if (string.IsNullOrWhiteSpace(request.CorrectAnswer))
        {
            throw new ArgumentNullException(nameof(request.CorrectAnswer));
        }
        if (string.IsNullOrWhiteSpace(request.UserAnswer))
        {
            throw new ArgumentNullException(nameof(request.UserAnswer));
        }

        var isCorrect = request.UserAnswer.Equals(request.CorrectAnswer, StringComparison.OrdinalIgnoreCase);
        var resultText = isCorrect ? "correct" : "incorrect";

        // Sanitize question text to remove newlines for a more stable prompt
        var sanitizedQuestion = request.Question.ReplaceLineEndings(" ");

        var userPrompt = $@"Question: {sanitizedQuestion}
Correct Answer: {request.CorrectAnswer}
User's Answer: {request.UserAnswer} ({resultText})
Question Type: {request.QuestionType}
All Options: {string.Join(", ", request.Options)}";

        if (!string.IsNullOrWhiteSpace(request.ExampleSentence))
        {
            userPrompt += $"\nExample Sentence: {request.ExampleSentence}";
        }

        userPrompt += "\n\nProvide a brief educational explanation about this question and answer.";

        try
        {
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(AIPrompts.QUESTION_EXPLANATION_SYSTEM_INSTRUCTIONS),
                new UserChatMessage(userPrompt)
            };

            var chatCompletionOptions = new ChatCompletionOptions
            {
                MaxOutputTokenCount = 1000,
            };

            ChatCompletion completion = await _chatClient.CompleteChatAsync(messages, chatCompletionOptions);
            var explanation = completion.Content[0].Text?.Trim();

            // Handle cases where the AI returns an empty or whitespace response
            if (string.IsNullOrWhiteSpace(explanation))
            {
                _logger.LogWarning("AI generated an empty or whitespace explanation");
                return "Sorry, I could not generate an explanation for this question.";
            }

            _logger.LogInformation("Generated question explanation");
            return explanation;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating question explanation");
            throw new InvalidOperationException("Failed to generate question explanation.", ex);
        }
    }

    #endregion

    #region Private Methods

    private async Task<string> ExecuteOpenAIGenerationRequestAsync(string systemPrompt, string userPrompt)
    {
        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(systemPrompt),
            new UserChatMessage(userPrompt)
        };

        var chatCompletionOptions = new ChatCompletionOptions
        {
            MaxOutputTokenCount = _aiSettings.MaxTokens,
        };

        try
        {
            ChatCompletion completion = await _chatClient.CompleteChatAsync(messages, chatCompletionOptions);
            var contentText = completion.Content[0].Text;
            var extractedJson = ExtractJsonFromAiResponse(contentText);

            if (string.IsNullOrWhiteSpace(extractedJson))
            {
                _logger.LogError("Could not extract valid JSON from the AI's text content. Original content text: {ContentText}", contentText);
                throw new InvalidOperationException("Failed to extract JSON from AI's text content.");
            }
            return extractedJson;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OpenAI API error during generation request.");
            throw;
        }
    }

    /// <summary>
    /// Validates the generated challenges
    /// </summary>
    private bool ValidateGeneratedChallenges(List<ChallengeQuestionResponse> questions)
    {
        if (questions == null || questions.Count == 0)
        {
            _logger.LogWarning("No challenges were generated");
            return false;
        }

        return questions.All(question =>
            !string.IsNullOrWhiteSpace(question.Question) &&
            !string.IsNullOrWhiteSpace(question.CorrectAnswer) &&
            question.Options?.Count > 0 &&
            question.Options.Contains(question.CorrectAnswer) &&
            Enum.IsDefined(typeof(ChallengeQuestionType), question.Type));
    }

    /// <summary>
    /// Extracts JSON content from potential markdown code blocks
    /// </summary>
    private static string ExtractJsonFromAiResponse(string aiResponse)
    {
        if (string.IsNullOrWhiteSpace(aiResponse))
        {
            return string.Empty;
        }

        string content = aiResponse.Trim();

        var match = Regex.Match(content, @"```(json)?(?<json>[\s\S]*)```");
        if (match.Success)
        {
            return match.Groups["json"].Value.Trim();
        }

        return content;
    }

    private async Task<T> RetryWithBackoffAsync<T>(Func<int, Task<T>> operation, int maxAttempts = 3)
    {
        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                return await operation(attempt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Operation failed on attempt {Attempt} of {MaxAttempts}", attempt, maxAttempts);
                if (attempt >= maxAttempts)
                {
                    throw;
                }
                await Task.Delay(1000 * attempt); // Simple exponential backoff
            }
        }
        throw new InvalidOperationException($"Operation failed after {maxAttempts} attempts");
    }

    private bool ValidateGeneratedFlashcards(List<Flashcard> flashcards)
    {
        if (flashcards == null || flashcards.Count == 0)
        {
            _logger.LogWarning("No flashcards were generated");
            return false;
        }

        return flashcards.All(flashcard =>
            !string.IsNullOrWhiteSpace(flashcard.FrontText) &&
            !string.IsNullOrWhiteSpace(flashcard.BackText) &&
            !string.IsNullOrWhiteSpace(flashcard.ExampleSentence) &&
            !string.IsNullOrWhiteSpace(flashcard.ExampleSentenceTranslation) &&
            Enum.IsDefined(typeof(DifficultyLevel), flashcard.Difficulty));
    }

    private string BuildFlashcardGenerationUserPrompt(FlashcardRequest request, IEnumerable<string>? existingFlashcardFrontTexts = null)
    {
        var userPromptBuilder = new StringBuilder()
            .AppendLine($"Create {request.Count} Lithuanian language flashcards.")
            .AppendLine($"Category: {request.PrimaryCategory}")
            .AppendLine($"Difficulty: {request.Difficulty}")
            .AppendLine($"Primary Category: {request.PrimaryCategory} (category code: {(int)request.PrimaryCategory})");

        if (existingFlashcardFrontTexts != null && existingFlashcardFrontTexts.Any())
        {
            userPromptBuilder.AppendLine("\nIMPORTANT: Do NOT create flashcards similar to these existing words:");
            var existingWords = string.Join(", ",
                existingFlashcardFrontTexts
                .Where(t => !string.IsNullOrEmpty(t))
                .OrderBy(t => t)
                .Select(t => t.Trim()));
            userPromptBuilder.AppendLine(existingWords);
            userPromptBuilder.AppendLine("\nCreate only flashcards that are conceptually distinct from these.");
        }
        return userPromptBuilder.ToString();
    }

    private static GeneratedImageSize ParseImageSize(string size) => size switch
    {
        "1024x1024" => GeneratedImageSize.W1024xH1024,
        "1792x1024" => GeneratedImageSize.W1792xH1024,
        "1024x1792" => GeneratedImageSize.W1024xH1792,
        _ => GeneratedImageSize.W1024xH1024,
    };

    private static GeneratedImageQuality ParseImageQuality(string quality) => quality switch
    {
        "low" => new GeneratedImageQuality("low"),       // Use string constructor for API-compatible values
        "medium" => new GeneratedImageQuality("medium"),
        "standard" => new GeneratedImageQuality("medium"), // Map standard to medium since API doesn't support standard
        "high" => new GeneratedImageQuality("high"),
        "hd" => new GeneratedImageQuality("high"),       // Map hd to high
        _ => new GeneratedImageQuality("low"),           // Default to low quality
    };

    #endregion
}
