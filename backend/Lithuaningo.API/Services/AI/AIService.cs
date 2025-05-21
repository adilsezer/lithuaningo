using System.Collections.Concurrent;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Storage;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services.AI;

/// <summary>
/// Unified service for handling AI interactions with configured providers (Gemini and OpenAI)
/// </summary>
public class AIService : IAIService
{
    #region Constants

    // private const string GeminiApiVersion = "v1beta"; // Removed, now in AISettings

    #endregion

    #region Private Fields

    // Store conversation history for sessions (will need adaptation for Gemini)
    private readonly ConcurrentDictionary<string, List<GeminiContent>> _conversationHistories = new(); // Corrected type

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly AISettings _aiSettings;
    private readonly ILogger<AIService> _logger;
    private readonly IStorageService _storageService;
    private readonly StorageSettings _storageSettings;

    #endregion

    #region Constructor

    /// <summary>
    /// Initializes a new instance of the <see cref="AIService"/> class.
    /// </summary>
    /// <param name="aiSettingsOptions">The AI settings</param>
    /// <param name="logger">The logger</param>
    /// <param name="storageService">The storage service</param>
    /// <param name="storageSettingsOptions">The storage settings</param>
    /// <param name="httpClientFactory">The HTTP client factory</param>
    public AIService(
        IOptions<AISettings> aiSettingsOptions,
        ILogger<AIService> logger,
        IStorageService storageService,
        IOptions<StorageSettings> storageSettingsOptions,
        IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _aiSettings = aiSettingsOptions.Value;
        _storageSettings = storageSettingsOptions.Value;
        _storageService = storageService;
        _httpClientFactory = httpClientFactory;

        _logger.LogInformation("AIService initialized for Gemini & OpenAI (audio)");
    }

    #endregion

    #region Public Methods

    /// <summary>
    /// Gets the service name
    /// </summary>
    /// <returns>The name of the AI service</returns>
    public string GetServiceName() => "Gemini & OpenAI (Audio)";

    /// <summary>
    /// Gets the model name used by this service (primary text model)
    /// </summary>
    /// <returns>The name of the AI model</returns>
    public string GetModelName() => _aiSettings.GeminiProModelName;

    /// <summary>
    /// Processes an AI request and returns a response
    /// </summary>
    /// <param name="prompt">The text prompt to send to the AI</param>
    /// <param name="context">Optional context parameters for the request</param>
    /// <returns>The AI's response text</returns>
    public async Task<string> GenerateChatResponseAsync(string prompt, Dictionary<string, string>? context = null)
    {
        _logger.LogInformation("Processing AI chat request with Gemini.");

        var sessionId = context?.GetValueOrDefault("sessionId") ?? "default_session";

        var conversationHistory = _conversationHistories.GetOrAdd(sessionId, _ =>
        {
            _logger.LogInformation("Creating new conversation history for session ID: {SessionId} with system message.", sessionId);
            // Initialize with system message as first user turn, and a model ack.
            return new List<GeminiContent>
            {
                new GeminiContent(new List<GeminiPart> { new GeminiPart(_aiSettings.SystemMessage) }, "user"),
                new GeminiContent(new List<GeminiPart> { new GeminiPart("Okay, I will act as a helpful assistant for Lithuaningo.") }, "model") // Model's acknowledgment of the system prompt
            };
        });

        // Add current user prompt
        conversationHistory.Add(new GeminiContent(new List<GeminiPart> { new GeminiPart(prompt) }, "user"));

        // Manage conversation history length (e.g., keep last 10 turns + initial system message pair)
        // Each "turn" is a user message + a model message. So 10 turns = 20 messages.
        // Plus the initial 2 system setup messages, so 22.
        // Let's aim for roughly 10 user/model exchanges after setup = 22 items. Max 11 user prompts + 11 model responses.
        // Current limit in old code was 11 messages total (1 system + 5 user + 5 model, or 1 system + 10 user/model messages with truncation).
        // Let's keep it similar: Max 10 user messages + initial system message. (approx 22 history items including model replies)
        const int maxHistoryItems = 22; // (System User + System Model) + 10 * (User + Model)
        if (conversationHistory.Count > maxHistoryItems)
        {
            _logger.LogWarning("Conversation history for session {SessionId} exceeds {MaxItems}. Truncating.", sessionId, maxHistoryItems);
            // Keep the first two (system setup) and the last (maxHistoryItems - 2) items.
            var oldHistory = conversationHistory.ToList(); // ToList for safe removal/re-add
            conversationHistory.Clear();
            conversationHistory.AddRange(oldHistory.Take(2)); // System setup
            conversationHistory.AddRange(oldHistory.Skip(oldHistory.Count - (maxHistoryItems - 2)));
        }

        var httpClient = _httpClientFactory.CreateClient("Gemini");
        var requestUrl = $"{_aiSettings.GeminiApiBaseUrl}/{_aiSettings.GeminiApiVersion}/models/{_aiSettings.GeminiFlashModelName}:generateContent?key={_aiSettings.GeminiApiKey}";

        var geminiRequest = new GeminiTextRequest(
            Contents: conversationHistory.ToList(), // Send the current history
            GenerationConfig: new GeminiGenerationConfig
            {
                Temperature = _aiSettings.DefaultTemperature,
                TopP = _aiSettings.DefaultTopP,
                MaxOutputTokens = _aiSettings.MaxTokens
            }
        );

        try
        {
            var jsonPayload = JsonSerializer.Serialize(geminiRequest, JsonSettings.DefaultOptions); // Assuming JsonSettings.DefaultOptions is compatible or create new options
            var httpContent = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, requestUrl) { Content = httpContent };
            var httpResponse = await httpClient.SendAsync(httpRequest);

            if (!httpResponse.IsSuccessStatusCode)
            {
                var errorBody = await httpResponse.Content.ReadAsStringAsync();
                _logger.LogError("Gemini API request failed. Status: {StatusCode}, Body: {ErrorBody}", httpResponse.StatusCode, errorBody);
                throw new HttpRequestException($"Gemini API request failed with status {httpResponse.StatusCode}: {errorBody}");
            }

            var responseBody = await httpResponse.Content.ReadAsStringAsync();
            var geminiResponse = JsonSerializer.Deserialize<GeminiTextResponse>(responseBody, JsonSettings.DefaultOptions);

            string aiResponseText = "I'm sorry, I couldn't generate a response."; // Default
            if (geminiResponse?.Candidates != null && geminiResponse.Candidates.Any())
            {
                var candidate = geminiResponse.Candidates[0];
                if (candidate.Content?.Parts != null && candidate.Content.Parts.Any())
                {
                    aiResponseText = candidate.Content.Parts[0].Text ?? aiResponseText;
                }
                // Log safety ratings or finish reason if needed
                if (candidate.FinishReason != null && candidate.FinishReason != "STOP")
                {
                    _logger.LogWarning("Gemini generation finished with reason: {FinishReason}", candidate.FinishReason);
                }
            }
            else
            {
                _logger.LogWarning("Gemini response did not contain any candidates or parts. Response: {ResponseBody}", responseBody);
            }

            // Add AI response to history
            conversationHistory.Add(new GeminiContent(new List<GeminiPart> { new GeminiPart(aiResponseText) }, "model"));
            return aiResponseText;
        }
        catch (JsonException jsonEx)
        {
            _logger.LogError(jsonEx, "Error deserializing Gemini API response.");
            throw new InvalidOperationException("Error processing response from AI service.", jsonEx);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AI request with Gemini.");
            throw; // Re-throw original exception to be caught by higher level handler
        }
    }

    /// <summary>
    /// Generates an image using ai based on the provided prompt, uploads it to storage, and returns the URL.
    /// </summary>
    /// <param name="flashcardFrontText">The Lithuanian front text of the flashcard (primary subject for the image).</param>
    /// <param name="exampleSentenceTranslation">The English translation of the example sentence for contextual understanding.</param>
    /// <returns>The public URL of the uploaded image.</returns>
    /// <exception cref="ArgumentNullException">Thrown when flashcardFrontText is null or empty. exampleSentenceTranslation can be empty.</exception>
    /// <exception cref="InvalidOperationException">Thrown when image generation or upload fails.</exception>
    public async Task<string> GenerateImageAsync(string flashcardFrontText, string exampleSentenceTranslation)
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

        try
        {
            // Step 1: Generate image data using AI
            var httpClient = _httpClientFactory.CreateClient("OpenAI");
            string apiUrl = $"{_aiSettings.OpenAIApiBaseUrl}/v1/images/generations";
            string combinedPrompt = string.Format(
                AIPrompts.IMAGE_GENERATION_PROMPT,
                flashcardFrontText,
                exampleSentenceTranslation ?? string.Empty
            );

            var payload = new
            {
                model = _aiSettings.OpenAIImageModelName,
                prompt = combinedPrompt,
                n = 1,
                size = _aiSettings.OpenAIImageSize,
                quality = _aiSettings.OpenAIImageQuality,
                background = "transparent" // Explicitly set transparent background
            };

            var jsonPayload = JsonSerializer.Serialize(payload, JsonSettings.DefaultOptions);
            var httpContent = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
            var request = new HttpRequestMessage(HttpMethod.Post, apiUrl) { Content = httpContent };
            request.Headers.Add("Authorization", $"Bearer {_aiSettings.OpenAIApiKey}");

            _logger.LogInformation("Requesting image generation from OpenAI with prompt: {Prompt}", payload.prompt);
            var response = await httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to generate image from OpenAI. Status: {StatusCode}, Response: {ErrorResponse}", response.StatusCode, errorContent);
                throw new InvalidOperationException($"Failed to generate image from OpenAI. Status: {response.StatusCode}, Details: {errorContent}");
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            using var openAIResponse = JsonDocument.Parse(responseBody);
            string? base64ImageData = null;
            if (openAIResponse.RootElement.TryGetProperty("data", out var dataArray) && dataArray.GetArrayLength() > 0)
            {
                if (dataArray[0].TryGetProperty("b64_json", out var b64JsonElement))
                {
                    base64ImageData = b64JsonElement.GetString();
                }
            }

            if (string.IsNullOrEmpty(base64ImageData))
            {
                _logger.LogError("OpenAI response did not contain base64 image data. Response: {ResponseBody}", responseBody);
                throw new InvalidOperationException("OpenAI response did not contain base64 image data.");
            }

            byte[] imageBytes = Convert.FromBase64String(base64ImageData);
            if (imageBytes == null || imageBytes.Length == 0)
            {
                _logger.LogError("Generated image bytes are null or empty after base64 decoding.");
                throw new InvalidOperationException("Generated image bytes are null or empty after base64 decoding.");
            }

            // Step 2: Upload image data to storage using _storageService
            _logger.LogInformation("Uploading generated image data to storage. Size: {ImageSize} bytes.", imageBytes.Length);

            var uploadedUrl = await _storageService.UploadBinaryDataAsync(
                imageBytes,
                "image/png", // Content type
                _storageSettings.Paths.Flashcards, // Folder from settings
                _storageSettings.Paths.Images,     // Subfolder from settings
                ".png"                             // File extension
            );

            if (string.IsNullOrEmpty(uploadedUrl))
            {
                _logger.LogError("Storage service returned an empty URL after uploading image data.");
                throw new InvalidOperationException("Storage service returned an empty URL after uploading image data.");
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
    /// <param name="exampleSentence">Optional example sentence to include after the text</param>
    /// <returns>URL to the generated audio file stored in cloud storage</returns>
    /// <exception cref="ArgumentNullException">Thrown when flashcardText is null or empty</exception>
    /// <exception cref="InvalidOperationException">Thrown when audio generation fails</exception>
    public async Task<string> GenerateAudioAsync(string flashcardText, string exampleSentence)
    {
        if (string.IsNullOrEmpty(flashcardText) || string.IsNullOrEmpty(exampleSentence))
        {
            _logger.LogError("Flashcard text or example sentence cannot be null or empty");
            throw new ArgumentNullException(nameof(flashcardText), "Flashcard text or example sentence cannot be null or empty");
        }

        try
        {
            var httpClient = _httpClientFactory.CreateClient("OpenAI");

            string textToSpeak = $"{flashcardText}. \n\n{exampleSentence}";

            var payload = new
            {
                model = _aiSettings.OpenAIAudioModelName,
                input = textToSpeak,
                voice = _aiSettings.DefaultVoice.ToLowerInvariant(), // Ensure voice is lowercase as per OpenAI docs
                // speed = 1.0f // Optional: map from settings if needed
            };

            var jsonPayload = JsonSerializer.Serialize(payload, JsonSettings.DefaultOptions);
            var httpContent = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, $"{_aiSettings.OpenAIApiBaseUrl}/v1/audio/speech")
            {
                Content = httpContent
            };
            request.Headers.Add("Authorization", $"Bearer {_aiSettings.OpenAIApiKey}");

            var response = await httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to generate audio from OpenAI. Status: {StatusCode}, Response: {ErrorResponse}", response.StatusCode, errorContent);
                throw new InvalidOperationException($"Failed to generate audio from OpenAI. Status: {response.StatusCode}, Details: {errorContent}");
            }

            var speechBytes = await response.Content.ReadAsByteArrayAsync();

            if (speechBytes == null || speechBytes.Length == 0)
            {
                _logger.LogError("Failed to generate audio: empty byte array response from OpenAI");
                throw new InvalidOperationException("Failed to generate audio: empty byte array response from OpenAI");
            }

            // Upload audio to storage
            var uploadedUrl = await _storageService.UploadBinaryDataAsync(
                speechBytes,
                "audio/mpeg", // OpenAI TTS typically returns mp3, which has MIME type audio/mpeg
                _storageSettings.Paths.Flashcards,
                _storageSettings.Paths.Audio,
                ".mp3" // Specify file extension
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
            var flashcardGenerationUserPrompt = BuildFlashcardGenerationUserPrompt(request, existingFlashcardFrontTexts);

            var aiResponseText = await ExecuteGeminiGenerationRequestAsync(
                _aiSettings.GeminiProModelName,
                AIPrompts.FLASHCARD_SYSTEM_INSTRUCTIONS,
                flashcardGenerationUserPrompt,
                new GeminiGenerationConfig // Use default generation config for flashcards
                {
                    Temperature = _aiSettings.DefaultTemperature,
                    TopP = _aiSettings.DefaultTopP,
                    MaxOutputTokens = _aiSettings.MaxTokens,
                    // CandidateCount is typically 1 for Gemini text models and might not be needed here
                }
            );

            if (string.IsNullOrWhiteSpace(aiResponseText))
            {
                _logger.LogWarning("AI response was null or whitespace on attempt {Attempt}.", attempt);
                throw new InvalidOperationException("AI response was null or whitespace.");
            }

            try
            {
                // aiResponseText from ExecuteGeminiGenerationRequestAsync is already the cleaned JSON string for flashcards.
                // No need to deserialize as GeminiTextResponse first or call ExtractJsonFromAiResponse again.
                var flashcards = JsonSerializer.Deserialize<List<Flashcard>>(aiResponseText, JsonSettings.AiOptions);

                if (flashcards == null || !flashcards.Any())
                {
                    _logger.LogWarning("Deserialized flashcards list is null or empty on attempt {Attempt}. Cleaned JSON: {CleanedJson}", attempt, aiResponseText);
                    throw new InvalidOperationException("Deserialized flashcards list is null or empty.");
                }

                if (!ValidateGeneratedFlashcards(flashcards))
                {
                    _logger.LogWarning("Generated flashcards failed validation on attempt {Attempt}. Count: {FlashcardCount}", attempt, flashcards.Count);
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred during flashcard generation on attempt {Attempt}.", attempt);
                throw; // Re-throw original exception to be caught by RetryWithBackoffAsync for retries
            }
        });
    }

    /// <summary>
    /// Clears conversation history for testing purposes
    /// </summary>
    /// <param name="sessionId">Optional specific session ID to clear, or all if null</param>
    public virtual void ClearConversationHistory(string? sessionId = null)
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

            var generationConfig = new GeminiGenerationConfig
            {
                Temperature = _aiSettings.DefaultTemperature,
                MaxOutputTokens = _aiSettings.MaxTokens,
                TopP = _aiSettings.DefaultTopP
            };

            var extractedJson = await ExecuteGeminiGenerationRequestAsync(
                _aiSettings.GeminiFlashModelName,
                AIPrompts.FLASHCARD_CHALLENGE_GENERATION_SYSTEM_INSTRUCTIONS,
                userPrompt,
                generationConfig
            );

            List<ChallengeQuestionResponse>? challengeResponses;
            try
            {
                challengeResponses = JsonSerializer.Deserialize<List<ChallengeQuestionResponse>>(extractedJson, JsonSettings.AiOptions);
            }
            catch (JsonException jsonEx)
            {
                _logger.LogError(jsonEx, "Error deserializing challenge questions JSON for flashcard {FlashcardId} on attempt {Attempt}. Extracted JSON: {ExtractedJson}", flashcard.Id, attempt, extractedJson);
                throw new InvalidOperationException("Failed to deserialize AI-generated challenge questions for flashcard.", jsonEx);
            }

            if (challengeResponses == null || !challengeResponses.Any() || !ValidateGeneratedChallenges(challengeResponses))
            {
                _logger.LogWarning("Generated challenges for flashcard {FlashcardId} on attempt {Attempt} are null, empty, or invalid. JSON: {ExtractedJson}", flashcard.Id, attempt, extractedJson);
                throw new InvalidOperationException("AI generated invalid or empty challenge questions for flashcard.");
            }

            _logger.LogInformation("Successfully generated {Count} challenges for flashcard ID: {FlashcardId} on attempt {Attempt}", challengeResponses.Count, flashcard.Id, attempt);
            return challengeResponses;
        });
    }

    #endregion

    #region Private Methods

    private async Task<string> ExecuteGeminiGenerationRequestAsync(
        string modelName,
        string systemPrompt,
        string userPrompt,
        GeminiGenerationConfig generationConfig,
        string? clientName = "GeminiApiClient") // Allow specifying client name if needed, defaults to GeminiApiClient
    {
        var client = _httpClientFactory.CreateClient(clientName ?? "GeminiApiClient");
        var requestUrl = $"{_aiSettings.GeminiApiBaseUrl}/v1beta/models/{modelName}:generateContent?key={_aiSettings.GeminiApiKey}";

        // Correctly structure contents for Gemini: System instruction as first user message, then model ack, then actual user prompt
        var contents = new List<GeminiContent>
        {
            new GeminiContent(Parts: new List<GeminiPart> { new GeminiPart(systemPrompt) }, Role: "user"), // System prompt as first user turn
            new GeminiContent(Parts: new List<GeminiPart> { new GeminiPart("Okay, I understand the instructions.") }, Role: "model"), // Model's acknowledgment
            new GeminiContent(Parts: new List<GeminiPart> { new GeminiPart(userPrompt) }, Role: "user") // Actual user prompt
        };

        var geminiRequest = new GeminiTextRequest(
            Contents: contents,
            GenerationConfig: generationConfig
        );

        var jsonRequest = JsonSerializer.Serialize(geminiRequest, JsonSettings.AiOptions);
        string? rawResponseString;

        var httpResponse = await client.PostAsync(requestUrl, new StringContent(jsonRequest, Encoding.UTF8, "application/json"));
        rawResponseString = await httpResponse.Content.ReadAsStringAsync();

        if (!httpResponse.IsSuccessStatusCode)
        {
            _logger.LogError("Gemini API error. Status: {StatusCode}, Response: {RawResponse}", httpResponse.StatusCode, rawResponseString);
            httpResponse.EnsureSuccessStatusCode(); // Let this throw for handling by RetryWithBackoffAsync or the caller
        }

        if (string.IsNullOrWhiteSpace(rawResponseString))
        {
            _logger.LogError("Received null or empty response from Gemini API.");
            throw new InvalidOperationException("AI service returned an empty response.");
        }

        // Attempt to deserialize the entire response to get to the actual content
        var geminiResponse = JsonSerializer.Deserialize<GeminiTextResponse>(rawResponseString, JsonSettings.AiOptions);

        if (geminiResponse?.Candidates == null || !geminiResponse.Candidates.Any() ||
            geminiResponse.Candidates[0].Content?.Parts == null || !geminiResponse.Candidates[0].Content.Parts.Any() ||
            string.IsNullOrWhiteSpace(geminiResponse.Candidates[0].Content.Parts[0].Text))
        {
            _logger.LogError("Could not extract valid content text from Gemini API response. Raw response: {RawResponse}", rawResponseString);
            throw new InvalidOperationException("Failed to extract content text from AI response.");
        }

        // The actual text content is what we expect to be the JSON payload (for flashcards/challenges)
        var contentText = geminiResponse.Candidates[0].Content.Parts[0].Text;

        // Now, extract the JSON from the content text, which might be wrapped in markdown
        var extractedJson = ExtractJsonFromAiResponse(contentText);

        if (string.IsNullOrWhiteSpace(extractedJson))
        {
            _logger.LogError("Could not extract valid JSON from the AI's text content. Original content text: {ContentText}, Raw response: {RawResponse}", contentText, rawResponseString);
            throw new InvalidOperationException("Failed to extract JSON from AI's text content.");
        }

        return extractedJson;
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

        // Pattern 1: Standard complete markdown block (e.g., ```json\n{...}\n```)
        // Regex accounts for optional "json" language specifier and ensures it captures content between the fences.
        var fullBlockMatch = Regex.Match(content, @"^```(?:json)?\s*\n([\s\S]+?)\n```$", RegexOptions.Multiline);
        if (fullBlockMatch.Success && fullBlockMatch.Groups.Count > 1)
        {
            return fullBlockMatch.Groups[1].Value.Trim();
        }

        // Pattern 2: Starts with markdown prefix (e.g., ```json\n{...), but possibly truncated (no proper closing ```)
        // Regex captures content after the initial fence.
        var prefixOnlyMatch = Regex.Match(content, @"^```(?:json)?\s*\n([\s\S]+)");
        if (prefixOnlyMatch.Success && prefixOnlyMatch.Groups.Count > 1)
        {
            string extractedContent = prefixOnlyMatch.Groups[1].Value.Trim();
            // If the extracted content itself ends with ``` (e.g., due to very short or malformed block), remove it.
            if (extractedContent.EndsWith("```"))
            {
                extractedContent = extractedContent.Substring(0, extractedContent.Length - 3).Trim();
            }
            return extractedContent; // This might be an incomplete JSON string if the original response was truncated
        }

        // Pattern 3: If it's not in a markdown block (or the patterns above didn't catch it),
        // assume it's direct JSON or a plain text error message from the AI.
        // If the content still starts with "```" here, it means our patterns failed unexpectedly for a markdown-like string.
        // In such a case, returning an empty string or logging an error might be preferable to passing invalid content to the deserializer.
        // However, for now, we pass the content as is, assuming it might be valid JSON or a non-JSON error message.
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
                _logger.LogError(ex, "Operation failed");
                if (attempt >= maxAttempts)
                {
                    throw;
                }
                await Task.Delay(100 * attempt); // Simple exponential backoff
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

    #endregion
}
