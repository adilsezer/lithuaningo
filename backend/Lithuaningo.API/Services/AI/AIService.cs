using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Text;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;
using OpenAI.Chat;
using OpenAI.Images;
using OpenAI.Audio;
using Microsoft.AspNetCore.Mvc;

namespace Lithuaningo.API.Services.AI;

/// <summary>
/// Unified service for handling AI interactions with OpenAI
/// </summary>
public class AIService : IAIService
{
    #region Constants
    
    // Chat system instructions
    private const string CHAT_SYSTEM_INSTRUCTIONS = 
        "You are a Lithuanian language learning assistant named Lithuaningo AI. " +
        "Only answer questions related to Lithuanian language, culture, history, or travel in Lithuania. " +
        "For any questions not related to Lithuanian topics, politely explain that you can only help with Lithuanian-related topics. " +
        "Always incorporate at least one Lithuanian word or fact in your responses to help the user learn. " +
        "Use friendly, conversational language suitable for a language learning app.";
    
    // Challenge system instructions with complete format requirements
    private const string CHALLENGE_SYSTEM_INSTRUCTIONS = @"You are creating Lithuanian language challenges based on flashcard data.

FORMAT: Return a JSON array of 5 challenge objects with these properties:
- question: A clear question using the template formats provided below
- options: Array of 4 possible answers (or 2 for true/false)
- correctAnswer: Must match exactly one option from the options array
- exampleSentence: Use the flashcard's example sentence
- type: Integer value (0=MultipleChoice, 1=TrueFalse, 2=FillInTheBlank)

RULES:
1. USE ONLY words and phrases from the provided flashcards
2. Create 5 questions total: 2 multiple-choice, 2 true/false, and 1 fill-in-blank
3. For each question, use appropriate template from below

QUESTION TEMPLATES:
- For Multiple Choice (type=0):
  * ""What does the word '{0}' mean?"" [options are English translations]
  * ""What is the grammatical form of '{0}'?""
  * ""Put the words in the correct order: {scrambled words}"" [options are different possible word orders]

- For True/False (type=1):
  * ""The word '{0}' means '{1}' (True or False)""
  * ""The grammatical form of '{0}' is {1} (True or False)""

- For Fill in the Blank (type=2):
  * ""Fill in the blank: {sentence with blank}""

EXAMPLE OUTPUT:
[
  {
    ""question"": ""What does the word 'Labas' mean?"",
    ""options"": [""Hello"", ""Goodbye"", ""Thank you"", ""Please""],
    ""correctAnswer"": ""Hello"",
    ""exampleSentence"": ""Labas, kaip sekasi?"",
    ""type"": 0
  },
  {
    ""question"": ""Put the words in the correct order: kaip labas sekasi"",
    ""options"": [""Labas, kaip sekasi?"", ""Kaip labas sekasi?"", ""Sekasi kaip labas?"", ""Kaip sekasi labas?""],
    ""correctAnswer"": ""Labas, kaip sekasi?"",
    ""exampleSentence"": ""Labas, kaip sekasi?"",
    ""type"": 0
  },
  {
    ""question"": ""The word 'Ačiū' means 'Thank you' (True or False)"",
    ""options"": [""True"", ""False""],
    ""correctAnswer"": ""True"",
    ""exampleSentence"": ""Ačiū už pagalbą."",
    ""type"": 1
  }
]";

    // Flashcard generation system instructions
    private const string FLASHCARD_SYSTEM_INSTRUCTIONS = @"You are creating Lithuanian language flashcards based on the given category and parameters.

FORMAT: Return a JSON array of flashcard objects with these properties:
{
  ""frontWord"": ""The Lithuanian word or phrase in Lithuanian"",
  ""backWord"": ""The English translation"",
  ""exampleSentence"": ""A practical example sentence in Lithuanian using the word"",
  ""exampleSentenceTranslation"": ""English translation of the example sentence"",
  ""notes"": ""Brief usage notes or tips about the word/phrase"",
  ""difficulty"": Integer (0=Basic, 1=Intermediate, 2=Advanced),
  ""categories"": Array of integers representing word categories
}

RULES:
1. Create accurate Lithuanian flashcards with correct grammar and spelling
2. Focus on the requested primary category and hint
3. Include vocabulary appropriate for the specified difficulty level
4. Provide practical, natural example sentences
5. ALWAYS use the EXACT difficulty level requested by the user (0, 1, or 2)
6. ALWAYS include the primary category in the categories array
7. Do NOT create flashcards similar to existing words provided
8. Each flashcard must be unique in the set

DIFFICULTY SPECIFICATIONS - USE EXACTLY AS REQUESTED:
- Basic (0): Most common everyday words (top 500-1000 frequency), concepts learned in first 1-3 months
- Intermediate (1): Less common vocabulary (1000-3000 frequency), specialized contexts, idioms
- Advanced (2): Rare or technical vocabulary, literary terms, specialized jargon, abstract concepts

CATEGORIES (Always use these numeric codes):
# Grammar Categories
0 = Verb (eiti, kalbėti)
1 = Noun (namas, šalis)
2 = Adjective (gražus, didelis)
3 = Adverb (greitai, labai)
4 = Pronoun (aš, tu, jis, ji)
5 = Connector (prepositions, conjunctions)

# Thematic Categories
100 = Greeting (labas, sveiki)
101 = Phrase (atsiprašau, prašom, ačiū)
102 = Number (counting words)
103 = TimeWord (vakar, šiandien, rytoj)
104 = Food (food and dining terms)
105 = Travel (travel-related terms)
106 = Family (family-related terms)
107 = Work (profession related terms)
108 = Nature (weather, nature terms)
999 = Other (miscellaneous terms)

CAPITALIZATION:
- Lowercase all Lithuanian words unless they're proper nouns
- Capitalize first letter of example sentences
- Lowercase English translations unless proper nouns

EXAMPLE OUTPUT:
[
  {
    ""frontWord"": ""duona"",
    ""backWord"": ""bread"",
    ""exampleSentence"": ""Man labai patinka šviežia duona."",
    ""exampleSentenceTranslation"": ""I really like fresh bread."",
    ""notes"": ""One of the most common food words, used daily in Lithuanian households."",
    ""difficulty"": 0,
    ""categories"": [104, 1]
  },
  {
    ""frontWord"": ""bendradarbis"",
    ""backWord"": ""colleague"",
    ""exampleSentence"": ""Mano bendradarbis padėjo man užbaigti projektą laiku."",
    ""exampleSentenceTranslation"": ""My colleague helped me finish the project on time."",
    ""notes"": ""Used in professional settings to refer to people you work with."",
    ""difficulty"": 1,
    ""categories"": [107, 1]
  },
  {
    ""frontWord"": ""įžvalgumas"",
    ""backWord"": ""perceptiveness"",
    ""exampleSentence"": ""Jo įžvalgumas padėjo išspręsti sudėtingą problemą."",
    ""exampleSentenceTranslation"": ""His perceptiveness helped solve the complex problem."",
    ""notes"": ""Abstract concept used in intellectual or psychological contexts."",
    ""difficulty"": 2,
    ""categories"": [2, 999]
  }
]";

    // Image generation system prompt
    private const string IMAGE_GENERATION_PROMPT = 
        "[TEXT_FREE=TRUE] Create a colorful, vivid visual representation of '{0}' for a language learning flashcard with these specifications:\n\n" +
        "1. CONTENT: Single clear concept that represents the word's meaning instantly\n" +
        "2. STYLE: Bold, vibrant illustration with strong visual impact\n" +
        "3. COLOR: Rich color palette (2-5 colors) with high contrast\n" +
        "4. COMPOSITION: Centered subject with clean edges against simple background\n" +
        "5. CLARITY: Must be immediately recognizable at small sizes\n\n" +
        "CRITICAL REQUIREMENTS:\n" +
        "- NO TEXT, LETTERS, NUMBERS OR SYMBOLS OF ANY KIND\n" +
        "- NO WRITTEN WORDS IN ANY LANGUAGE\n" +
        "- NO BORDERS, LABELS OR ANNOTATIONS\n" +
        "- PURE VISUAL IMAGERY ONLY\n\n" +
        "TYPE-BASED GUIDANCE:\n" +
        "- For concrete nouns → show the exact object (e.g., 'bread' → loaf of bread)\n" +
        "- For verbs → show action being performed (e.g., 'run' → person running)\n" +
        "- For adjectives → show object with that quality (e.g., 'tall' → tall building)\n" +
        "- For abstract concepts → use clear metaphor (e.g., 'freedom' → bird flying)\n\n" +
        "Create a DALL-E optimized image that helps language learners instantly associate the visual with the meaning of '{0}'.";

    #endregion
    
    #region Private Fields
    
    // Store conversation history for sessions
    private readonly ConcurrentDictionary<string, List<ChatMessage>> _conversationHistories = new();
    
    // The chat client instance for this service
    private readonly ChatClient _chatClient;
    
    // The model name used by this service
    private readonly string _modelName;
    
    // Logger instance
    private readonly ILogger<AIService> _logger;
    
    // Configuration settings
    private readonly OpenAISettings _openAiSettings;
    
    // Storage service
    private readonly IStorageService _storageService;
    
    // Storage settings
    private readonly StorageSettings _storageSettings;
    
    #endregion
    
    #region Constructor
    
    /// <summary>
    /// Initializes a new instance of the <see cref="AIService"/> class.
    /// </summary>
    /// <param name="openAiSettings">The OpenAI settings</param>
    /// <param name="logger">The logger</param>
    /// <param name="storageService">The storage service</param>
    /// <param name="storageSettings">The storage settings</param>
    /// <param name="chatClient">Optional chat client for testing</param>
    public AIService(
        IOptions<OpenAISettings> openAiSettings,
        ILogger<AIService> logger,
        IStorageService storageService,
        IOptions<StorageSettings> storageSettings,
        ChatClient? chatClient = null)
    {
        _logger = logger;
        _openAiSettings = openAiSettings.Value;
        _storageSettings = storageSettings.Value;
        
        // Set the model name from settings
        _modelName = _openAiSettings.ChatModelName;
        
        // Use provided client or create a new one
        _chatClient = chatClient ?? CreateChatClient(_modelName);
        
        _logger.LogInformation("AIService initialized with model: {ModelName}", _modelName);
        
        _storageService = storageService;
    }
    
    #endregion
    
    #region Public Methods
    
    /// <summary>
    /// Gets the service name
    /// </summary>
    /// <returns>The name of the AI service</returns>
    public string GetServiceName() => "OpenAI";
    
    /// <summary>
    /// Gets the model name used by this service
    /// </summary>
    /// <returns>The name of the AI model</returns>
    public string GetModelName() => _modelName;
    
    /// <summary>
    /// Processes an AI request and returns a response
    /// </summary>
    /// <param name="prompt">The text prompt to send to the AI</param>
    /// <param name="context">Optional context parameters for the request</param>
    /// <param name="serviceType">The type of AI service to use (chat or challenge)</param>
    /// <returns>The AI's response text</returns>
    public async Task<string> ProcessRequestAsync(string prompt, Dictionary<string, string>? context = null, string serviceType = "chat")
    {
        try
        {
            return await HandleChatRequestAsync(prompt, context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AI request with service type {ServiceType}", serviceType);
            throw;
        }
    }
    
    /// <summary>
    /// Generates an image using DALL-E based on the provided prompt
    /// </summary>
    /// <param name="flashcardWord">The Lithuanian word to illustrate</param>
    /// <returns>URL to the generated image stored in Cloudflare R2</returns>
    /// <exception cref="ArgumentNullException">Thrown when flashcardWord is null or empty</exception>
    /// <exception cref="InvalidOperationException">Thrown when image generation fails</exception>
    public async Task<string> GenerateImageAsync(string flashcardWord)
    {
        if (string.IsNullOrEmpty(flashcardWord))
        {
            _logger.LogError("Flashcard word cannot be null or empty");
            throw new ArgumentNullException(nameof(flashcardWord), "Flashcard word cannot be null or empty");
        }

        try
        {
            _logger.LogInformation("Generating image with flashcard word: {FlashcardWord}", flashcardWord);
            
            // Create image client with API key from settings
            var imageClient = new ImageClient(_openAiSettings.ImageModelName, _openAiSettings.ApiKey);

            // Configure image generation options
            var options = new ImageGenerationOptions
            {
                ResponseFormat = GeneratedImageFormat.Bytes, // Request direct bytes instead of URL
                Style = GeneratedImageStyle.Vivid
            };

            // Set image quality based on the settings
            switch (_openAiSettings.ImageQuality)
            {
                case "standard":
                    options.Quality = GeneratedImageQuality.Standard;
                    break;
                case "hd":
                    options.Quality = GeneratedImageQuality.High;
                    break;
                default:
                    options.Quality = GeneratedImageQuality.Standard;
                    break;
            }

            // Set image size based on the settings
            switch (_openAiSettings.DefaultImageSize)
            {
                case "256x256":
                    options.Size = GeneratedImageSize.W256xH256;
                    break;
                case "512x512":
                    options.Size = GeneratedImageSize.W512xH512;
                    break;
                case "1024x1024":
                    options.Size = GeneratedImageSize.W1024xH1024;
                    break;
                default:
                    options.Size = GeneratedImageSize.W256xH256;
                    break;
            }
            
            // Generate the image and get bytes directly
            _logger.LogInformation("Calling OpenAI API to generate image with size: {0}", options.Size);
            string prompt = string.Format(IMAGE_GENERATION_PROMPT, flashcardWord);
            _logger.LogInformation("Prompt: {Prompt}", prompt);
            
            GeneratedImage image = await imageClient.GenerateImageAsync(prompt, options);
            
            if (image == null)
            {
                _logger.LogError("Failed to generate image: null response");
                throw new InvalidOperationException("Failed to generate image: null response");
            }

            // Get the image bytes directly
            if (image.ImageBytes == null)
            {
                _logger.LogError("Generated image bytes are null");
                throw new InvalidOperationException("Generated image bytes are null");
            }
            
            _logger.LogInformation("Image generated successfully, uploading to storage");

            // Upload directly to R2 storage using the binary upload method
            var uploadedUrl = await _storageService.UploadBinaryDataAsync(
                image.ImageBytes.ToArray(), 
                "image/png", 
                _storageSettings.Paths.Flashcards, 
                _storageSettings.Paths.Images);

            _logger.LogInformation("Image uploaded to storage: {URL}", uploadedUrl);
            return uploadedUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating image: {Message}", ex.Message);
            throw new InvalidOperationException($"Error generating image: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Generates audio using OpenAI's text-to-speech service
    /// </summary>
    /// <param name="flashcardWord">The Lithuanian word to convert to speech</param>
    /// <returns>URL to the generated audio file stored in cloud storage</returns>
    /// <exception cref="ArgumentNullException">Thrown when flashcardWord is null or empty</exception>
    /// <exception cref="InvalidOperationException">Thrown when audio generation fails</exception>
    public async Task<string> GenerateAudioAsync(string flashcardWord)
    {
        if (string.IsNullOrEmpty(flashcardWord))
        {
            _logger.LogError("Flashcard word cannot be null or empty");
            throw new ArgumentNullException(nameof(flashcardWord), "Flashcard word cannot be null or empty");
        }

        try
        {
            _logger.LogInformation("Generating audio for flashcard word: {FlashcardWord}", flashcardWord);
            
            // Create audio client with API key from settings
            var audioClient = new AudioClient(_openAiSettings.AudioModelName, _openAiSettings.ApiKey);
            
            var options = new SpeechGenerationOptions
            {
                SpeedRatio = 1.0f,
            };
            // Get voice from settings or use Nova as default
            var ttsVoice = _openAiSettings.DefaultVoice.ToLower() switch
            {
                "alloy" => GeneratedSpeechVoice.Alloy,
                "echo" => GeneratedSpeechVoice.Echo,
                "fable" => GeneratedSpeechVoice.Fable,
                "onyx" => GeneratedSpeechVoice.Onyx,
                "nova" => GeneratedSpeechVoice.Nova,
                "shimmer" => GeneratedSpeechVoice.Shimmer,
                _ => GeneratedSpeechVoice.Nova // Default to Nova voice
            };
            
            _logger.LogInformation("Using voice: {Voice} for text-to-speech", ttsVoice);
            
            // Generate speech with just the word itself
            _logger.LogDebug("Generating audio for: {Word}", flashcardWord);
            BinaryData speech = await audioClient.GenerateSpeechAsync(flashcardWord, ttsVoice, options);
            
            if (speech == null)
            {
                _logger.LogError("Failed to generate audio: null response");
                throw new InvalidOperationException("Failed to generate audio: null response");
            }
            
            _logger.LogInformation("Audio generated successfully, uploading to storage");

            // Upload to storage
            var uploadedUrl = await _storageService.UploadBinaryDataAsync(
                speech.ToArray(), 
                "audio/mp3", 
                _storageSettings.Paths.Flashcards, 
                _storageSettings.Paths.Audio);

            _logger.LogInformation("Audio uploaded to storage: {URL}", uploadedUrl);
            return uploadedUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating audio: {Message}", ex.Message);
            throw new InvalidOperationException($"Error generating audio: {ex.Message}", ex);
        }
    }
    
    /// <summary>
    /// Generates a set of challenge questions using AI based on the provided parameters
    /// </summary>
    /// <param name="request">The parameters for challenge generation, including topic and difficulty</param>
    /// <returns>A list of challenge questions with multiple choice, true/false, and fill-in-blank options</returns>
    /// <exception cref="ArgumentNullException">Thrown when request is null</exception>
    /// <exception cref="InvalidOperationException">Thrown when AI response is invalid or validation fails</exception>
    public async Task<List<ChallengeQuestionResponse>> GenerateChallengesAsync(CreateChallengeRequest request)
    {
        if (request == null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        return await RetryWithBackoffAsync(async (attempt) =>
        {
            _logger.LogInformation("Generating challenges with AI for description '{Description}', attempt {Attempt}", 
                request.Description, attempt);

            var prompt = new StringBuilder()
                .AppendLine($"Create {request.Count} Lithuanian language challenges.")
                .AppendLine($"Description: {request.Description}")
                .ToString();

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(CHALLENGE_SYSTEM_INSTRUCTIONS),
                new UserChatMessage(prompt.ToString())
            };

            var completion = await _chatClient.CompleteChatAsync(messages.ToArray());
            var jsonResponse = completion.Value.Content[0].Text;

            if (string.IsNullOrEmpty(jsonResponse))
            {
                throw new InvalidOperationException("AI returned empty response");
            }

            var jsonContent = ExtractJsonFromAiResponse(jsonResponse);
            if (string.IsNullOrEmpty(jsonContent))
            {
                throw new InvalidOperationException("Failed to extract JSON content from AI response");
            }

            jsonContent = ConvertStringTypeToIntIfNeeded(jsonContent);
            var questions = JsonSerializer.Deserialize<List<ChallengeQuestionResponse>>(
                jsonContent,
                new JsonSerializerOptions { 
                    PropertyNameCaseInsensitive = true,
                    AllowTrailingCommas = true,
                    ReadCommentHandling = JsonCommentHandling.Skip,
                    Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
                }
            );

            if (questions == null || !questions.Any() || !ValidateGeneratedChallenges(questions))
            {
                throw new InvalidOperationException("Generated questions failed validation");
            }

            // Generate IDs for each question
            foreach (var question in questions)
            {
                question.Id = Guid.NewGuid();
            }

            return questions;
        });
    }

    /// <summary>
    /// Validates the generated flashcards
    /// </summary>
    private bool ValidateGeneratedFlashcards(List<Flashcard> flashcards)
    {
        if (flashcards == null || !flashcards.Any())
        {
            _logger.LogWarning("No flashcards were generated");
            return false;
        }

        return flashcards.All(flashcard =>
            !string.IsNullOrWhiteSpace(flashcard.FrontWord) &&
            !string.IsNullOrWhiteSpace(flashcard.BackWord) &&
            !string.IsNullOrWhiteSpace(flashcard.ExampleSentence) &&
            !string.IsNullOrWhiteSpace(flashcard.ExampleSentenceTranslation) &&
            Enum.IsDefined(typeof(DifficultyLevel), flashcard.Difficulty));
    }

    /// <summary>
    /// Generates a set of flashcards using AI based on the provided parameters
    /// </summary>
    /// <param name="request">The parameters for flashcard generation, including primary category and difficulty</param>
    /// <param name="existingWords">Optional existing words to avoid in the generated flashcards</param>
    /// <returns>A list of generated flashcards</returns>
    /// <exception cref="ArgumentNullException">Thrown when request is null</exception>
    /// <exception cref="InvalidOperationException">Thrown when AI response is invalid or empty</exception>
    public async Task<List<Flashcard>> GenerateFlashcardsAsync(FlashcardRequest request, IEnumerable<string>? existingWords = null)
    {
        if (request == null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        return await RetryWithBackoffAsync(async (attempt) =>
        {
            _logger.LogInformation("Generating flashcards with AI for category '{Category}' with difficulty '{Difficulty}', attempt {Attempt}", 
                request.PrimaryCategory, request.Difficulty, attempt);

            var prompt = new StringBuilder()
                .AppendLine($"Create {request.Count} Lithuanian language flashcards.")
                .AppendLine($"Category: {request.PrimaryCategory}")
                .AppendLine($"Difficulty: {request.Difficulty}")
                .AppendLine($"Primary Category: {request.PrimaryCategory} (category code: {(int)request.PrimaryCategory})");

            // Add the hint if provided
            if (!string.IsNullOrEmpty(request.Hint))
            {
                prompt.AppendLine($"Hint: {request.Hint}");
            }

            // Add a limited set of existing words to avoid duplicates
            if (existingWords?.Any() == true)
            {
                prompt.AppendLine("\nAvoid creating flashcards similar to these existing words:");
                foreach (var word in existingWords)
                {
                    prompt.AppendLine($"- {word}");
                }
            }

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(FLASHCARD_SYSTEM_INSTRUCTIONS),
                new UserChatMessage(prompt.ToString())
            };

            var completion = await _chatClient.CompleteChatAsync(messages.ToArray());
            var jsonResponse = completion.Value.Content[0].Text;

            if (string.IsNullOrEmpty(jsonResponse))
            {
                throw new InvalidOperationException("AI returned empty response");
            }

            var jsonContent = ExtractJsonFromAiResponse(jsonResponse);
            if (string.IsNullOrEmpty(jsonContent))
            {
                throw new InvalidOperationException("Failed to extract JSON content from AI response");
            }

            // Use standard JSON deserialization with property name case insensitivity
            var serializerOptions = new JsonSerializerOptions { 
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true,
                ReadCommentHandling = JsonCommentHandling.Skip
            };
            
            var flashcards = JsonSerializer.Deserialize<List<Flashcard>>(jsonContent, serializerOptions);

            if (flashcards == null || !flashcards.Any())
            {
                throw new InvalidOperationException("Generated flashcards failed validation");
            }

            // Post-process the flashcards to ensure they have required properties
            foreach (var flashcard in flashcards)
            {
                // Set a unique ID
                flashcard.Id = Guid.NewGuid();
                
                // Ensure categories list exists
                flashcard.Categories ??= new List<int>();
                
                // Ensure primary category is included
                int primaryCategoryValue = (int)request.PrimaryCategory;
                if (!flashcard.Categories.Contains(primaryCategoryValue))
                {
                    flashcard.Categories.Add(primaryCategoryValue);
                }
            }

            if (!ValidateGeneratedFlashcards(flashcards))
            {
                throw new InvalidOperationException("Generated flashcards failed validation");
            }

            // Limit to the requested count
            var limitedFlashcards = flashcards.Take(request.Count).ToList();

            _logger.LogInformation("Successfully generated {Count} flashcards for category '{Category}'", 
                limitedFlashcards.Count, request.PrimaryCategory);

            return limitedFlashcards;
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
        }
        else
        {
            _conversationHistories.Clear();
        }
    }
    
    
    
    #endregion
    
    #region Protected Methods
    
    /// <summary>
    /// Creates a new ChatClient with the configured API key
    /// </summary>
    /// <param name="modelName">Model name to use</param>
    /// <returns>A configured ChatClient instance</returns>
    protected virtual ChatClient CreateChatClient(string modelName)
    {
        _logger.LogInformation("Creating ChatClient with model: {Model}", modelName);
        return new ChatClient(modelName, _openAiSettings.ApiKey);
    }
    
    #endregion
    
    #region Private Methods
    
    /// <summary>
    /// Handles a chat request
    /// </summary>
    private async Task<string> HandleChatRequestAsync(string message, Dictionary<string, string>? context)
    {
        // Ensure sessionId is never null by using a default value
        var sessionId = context?.GetValueOrDefault("sessionId") ?? "default_session";
        
        var conversationHistory = _conversationHistories.GetOrAdd(
            sessionId,
            _ => new List<ChatMessage> { new SystemChatMessage(CHAT_SYSTEM_INSTRUCTIONS) }
        );

        conversationHistory.Add(new UserChatMessage(message));

        if (conversationHistory.Count > 11)
        {
            var systemMessage = conversationHistory[0];
            conversationHistory.RemoveRange(1, conversationHistory.Count - 11);
            conversationHistory.Insert(0, systemMessage);
        }

        var completion = await _chatClient.CompleteChatAsync(conversationHistory.ToArray());
        var aiResponse = completion.Value.Content[0].Text ?? "I'm sorry, I couldn't generate a response.";
        
        conversationHistory.Add(new AssistantChatMessage(aiResponse));
        return aiResponse;
    }

    /// <summary>
    /// Validates the generated challenges
    /// </summary>
    private bool ValidateGeneratedChallenges(List<ChallengeQuestionResponse> questions)
    {
        if (questions == null || !questions.Any())
        {
            _logger.LogWarning("No challenges were generated");
            return false;
        }

        return questions.All(question =>
            !string.IsNullOrWhiteSpace(question.Question) &&
            !string.IsNullOrWhiteSpace(question.CorrectAnswer) &&
            question.Options?.Any() == true &&
            question.Options.Contains(question.CorrectAnswer) &&
            Enum.IsDefined(typeof(ChallengeQuestionType), question.Type));
    }
    
    /// <summary>
    /// Extracts JSON content from potential markdown code blocks
    /// </summary>
    private string ExtractJsonFromAiResponse(string aiResponse)
    {
        if (string.IsNullOrEmpty(aiResponse))
        {
            return string.Empty;
        }

        // Check if the response is a markdown code block and extract the JSON content
        var jsonBlockPattern = @"```(?:json)?\s*\n([\s\S]*?)\n```";
        var jsonBlockMatch = Regex.Match(aiResponse, jsonBlockPattern);

        if (jsonBlockMatch.Success && jsonBlockMatch.Groups.Count > 1)
        {
            return jsonBlockMatch.Groups[1].Value.Trim();
        }

        // If no markdown code block, try to find a JSON array directly
        var jsonArrayPattern = @"^\s*\[\s*\{[\s\S]*\}\s*\]\s*$";
        var jsonArrayMatch = Regex.Match(aiResponse, jsonArrayPattern);

        if (jsonArrayMatch.Success)
        {
            return jsonArrayMatch.Value.Trim();
        }

        // If no direct JSON array, return the full response (which might be JSON or might need more cleanup)
        return aiResponse.Trim();
    }
    
    /// <summary>
    /// Converts string type values to integers if needed (to handle AI sometimes returning string enum values)
    /// </summary>
    private string ConvertStringTypeToIntIfNeeded(string jsonContent)
    {
        // Try to handle cases where the type is provided as a string like "0", "1", "2"
        // or as words like "MultipleChoice", "TrueFalse", "FillInTheBlank"
        var typePatterns = new Dictionary<string, string>
        {
            { @"""type""\s*:\s*""0""", @"""type"":0" },
            { @"""type""\s*:\s*""1""", @"""type"":1" },
            { @"""type""\s*:\s*""2""", @"""type"":2" },
            { @"""type""\s*:\s*""MultipleChoice""", @"""type"":0" },
            { @"""type""\s*:\s*""TrueFalse""", @"""type"":1" },
            { @"""type""\s*:\s*""FillInTheBlank""", @"""type"":2" }
        };

        return typePatterns.Aggregate(jsonContent, (current, pattern) => 
            current.Replace(pattern.Key, pattern.Value));
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
                _logger.LogError(ex, "Operation failed on attempt {Attempt}", attempt);
                if (attempt >= maxAttempts)
                {
                    throw;
                }
                await Task.Delay(100 * attempt); // Simple exponential backoff
            }
        }
        throw new InvalidOperationException($"Operation failed after {maxAttempts} attempts");
    }
    
    #endregion
} 