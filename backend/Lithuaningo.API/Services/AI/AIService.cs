using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Text;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;
using OpenAI.Chat;

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

    #endregion
    
    #region Private Fields
    
    // Store conversation history for sessions
    protected readonly ConcurrentDictionary<string, List<ChatMessage>> _conversationHistories = new();
    
    // The chat client instance for this service
    private readonly ChatClient _chatClient;
    
    // The model name used by this service
    private readonly string _modelName;
    
    // Logger instance
    private readonly ILogger<AIService> _logger;
    
    // Configuration settings
    private readonly OpenAISettings _openAiSettings;
    
    #endregion
    
    #region Constructor
    
    /// <summary>
    /// Initializes a new instance of the <see cref="AIService"/> class.
    /// </summary>
    /// <param name="openAiSettings">The OpenAI settings</param>
    /// <param name="logger">The logger</param>
    /// <param name="chatClient">Optional chat client for testing</param>
    public AIService(
        IOptions<OpenAISettings> openAiSettings,
        ILogger<AIService> logger,
        ChatClient? chatClient = null)
    {
        _logger = logger;
        _openAiSettings = openAiSettings.Value;
        
        // Set the model name from settings
        _modelName = _openAiSettings.ChatModelName;
        
        // Use provided client or create a new one
        _chatClient = chatClient ?? CreateChatClient(_modelName);
        
        _logger.LogInformation("AIService initialized with model: {ModelName}", _modelName);
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
        serviceType = serviceType.ToLowerInvariant();
        
        _logger.LogInformation("Processing AI request using service type: {ServiceType}", serviceType);
        
        try
        {
            // Process based on service type
            var aiResponse = await HandleChatRequestAsync(prompt, context);
            return aiResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AI request with service type {ServiceType}", serviceType);
            throw;
        }
    }
    
    /// <summary>
    /// Generates challenge questions using AI based on provided flashcards
    /// </summary>
    /// <param name="flashcards">List of flashcards to use for generating questions</param>
    /// <returns>A list of challenge questions</returns>
    public async Task<List<CreateChallengeQuestionRequest>> GenerateChallengeQuestionsAsync(List<Models.Flashcard> flashcards)
    {
        // Retry up to 3 times if necessary
        for (int attempt = 1; attempt <= 3; attempt++)
        {
            try
            {
                _logger.LogInformation("Generating challenges with AI from {Count} flashcards, attempt {Attempt}", 
                    flashcards.Count, attempt);
                
                // Get raw JSON response from the AI
                var jsonResponse = await HandleFlashcardChallengeRequestAsync(flashcards);
                
                if (string.IsNullOrEmpty(jsonResponse))
                {
                    _logger.LogWarning("AI returned empty response on attempt {Attempt}", attempt);
                    continue;
                }
                
                // Extract and clean up JSON content
                var jsonContent = ExtractJsonFromAiResponse(jsonResponse);
                
                // Convert string enum values to integers if needed
                if (!string.IsNullOrEmpty(jsonContent))
                {
                    jsonContent = ConvertStringTypeToIntIfNeeded(jsonContent);
                }
                
                // Try to deserialize the JSON
                List<CreateChallengeQuestionRequest>? generatedQuestions = null;
                try
                {
                    // Parse the JSON response into challenge question models
                    generatedQuestions = JsonSerializer.Deserialize<List<CreateChallengeQuestionRequest>>(
                        jsonContent ?? string.Empty,
                        new JsonSerializerOptions { 
                            PropertyNameCaseInsensitive = true,
                            AllowTrailingCommas = true,
                            ReadCommentHandling = JsonCommentHandling.Skip,
                            Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
                        }
                    );
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "JSON deserialization error on attempt {Attempt}", attempt);
                    continue;
                }
                
                // Verify the deserialized data
                if (generatedQuestions == null || generatedQuestions.Count == 0)
                {
                    _logger.LogWarning("No valid questions were deserialized from AI response, attempt {Attempt}", attempt);
                    continue;
                }
                
                // Validate the questions
                if (!ValidateGeneratedChallenges(generatedQuestions))
                {
                    _logger.LogWarning("Generated questions failed validation, attempt {Attempt}", attempt);
                    continue;
                }
                
                return generatedQuestions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating challenges from flashcards, attempt {Attempt}", attempt);
                
                if (attempt >= 3)
                {
                    throw;
                }
            }
        }
        
        // If we get here, all attempts have failed
        throw new Exception("Failed to generate challenge questions from flashcards after multiple attempts");
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
        // Generate a session ID from context if available, otherwise use a default
        string sessionId = "default_session";
        if (context != null && context.TryGetValue("sessionId", out var id))
        {
            sessionId = id;
        }

        // Get or create conversation history for this session
        var conversationHistory = _conversationHistories.GetOrAdd(sessionId, _ => new List<ChatMessage>
        {
            new SystemChatMessage(CHAT_SYSTEM_INSTRUCTIONS)
        });

        // Add the user's message to the conversation history
        conversationHistory.Add(new UserChatMessage(message));

        // If conversation is too long, keep only the last 10 messages plus system prompt
        if (conversationHistory.Count > 11)
        {
            var systemMessage = conversationHistory[0];
            conversationHistory.RemoveRange(1, conversationHistory.Count - 11);
            conversationHistory.Insert(0, systemMessage);
        }

        // Send the request to OpenAI
        var completion = await _chatClient.CompleteChatAsync(conversationHistory.ToArray());
        
        // Extract the response text from the completion
        var aiResponse = completion.Value.Content[0].Text;
        if (string.IsNullOrEmpty(aiResponse))
        {
            aiResponse = "I'm sorry, I couldn't generate a response.";
        }

        // Add the AI's response to the conversation history
        conversationHistory.Add(new AssistantChatMessage(aiResponse));
        
        return aiResponse;
    }
    
    /// <summary>
    /// Handles AI request for generating challenge questions based on flashcards
    /// </summary>
    /// <param name="flashcards">The flashcards to use for generating questions</param>
    /// <returns>The AI response as a string</returns>
    private async Task<string> HandleFlashcardChallengeRequestAsync(List<Models.Flashcard> flashcards)
    {
        if (flashcards == null || flashcards.Count == 0)
        {
            _logger.LogWarning("No flashcards provided for challenge generation");
            return "[]";
        }
        
        // Prepare flashcard data for the prompt
        var flashcardData = new StringBuilder();
        flashcardData.AppendLine("Here are the flashcards to use for generating questions:");
        
        foreach (var flashcard in flashcards)
        {
            flashcardData.AppendLine($"- Lithuanian word: {flashcard.FrontWord}");
            flashcardData.AppendLine($"  Translation: {flashcard.BackWord}");
            
            if (!string.IsNullOrEmpty(flashcard.ExampleSentence))
            {
                flashcardData.AppendLine($"  Example sentence: {flashcard.ExampleSentence}");
                
                if (!string.IsNullOrEmpty(flashcard.ExampleSentenceTranslation))
                {
                    flashcardData.AppendLine($"  Example translation: {flashcard.ExampleSentenceTranslation}");
                }
            }
            
            flashcardData.AppendLine();
        }
        
        // For challenge generation, we use detailed system instructions and flashcard data
        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(CHALLENGE_SYSTEM_INSTRUCTIONS),
            new UserChatMessage($@"Create Lithuanian language challenges using these flashcards:

{flashcardData}")
        };

        // Send the request to OpenAI
        var completion = await _chatClient.CompleteChatAsync(messages.ToArray());
        
        // Extract the response text from the completion
        var jsonResponse = completion.Value.Content[0].Text;
        if (string.IsNullOrEmpty(jsonResponse))
        {
            return "[]"; // Return empty JSON array if no response
        }
        
        return jsonResponse;
    }
    
    /// <summary>
    /// Validates the generated challenges
    /// </summary>
    private bool ValidateGeneratedChallenges(List<CreateChallengeQuestionRequest> questions)
    {
        if (questions == null || !questions.Any())
        {
            _logger.LogWarning("No challenges were generated");
            return false;
        }

        foreach (var question in questions)
        {
            // Check required fields
            if (string.IsNullOrWhiteSpace(question.Question))
            {
                _logger.LogWarning("Question text is missing");
                return false;
            }

            if (string.IsNullOrWhiteSpace(question.CorrectAnswer))
            {
                _logger.LogWarning("CorrectAnswer is missing");
                return false;
            }

            // Check options
            if (question.Options == null || !question.Options.Any())
            {
                _logger.LogWarning("Options array is missing or empty");
                return false;
            }

            // Make sure correct answer is in the options
            if (!question.Options.Contains(question.CorrectAnswer))
            {
                _logger.LogWarning("CorrectAnswer is not found in the options array");
                return false;
            }

            // Validate question type
            if (!Enum.IsDefined(typeof(ChallengeQuestionType), question.Type))
            {
                _logger.LogWarning("Invalid question type value: {Type}", question.Type);
                return false;
            }
        }

        return true;
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

        foreach (var pattern in typePatterns)
        {
            jsonContent = Regex.Replace(jsonContent, pattern.Key, pattern.Value, RegexOptions.IgnoreCase);
        }

        return jsonContent;
    }
    
    #endregion
} 