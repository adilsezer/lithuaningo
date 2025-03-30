using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Text;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.DTOs.Flashcard;
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

    // Flashcard generation system instructions
    private const string FLASHCARD_SYSTEM_INSTRUCTIONS = @"You are creating Lithuanian language flashcards based on the given topic and parameters.

FORMAT: Return a JSON array of flashcard objects with these properties:
{
  ""frontWord"": ""The Lithuanian word or phrase"",
  ""backWord"": ""The English translation"",
  ""exampleSentence"": ""A practical example sentence in Lithuanian using the word"",
  ""exampleSentenceTranslation"": ""English translation of the example sentence"",
  ""notes"": ""Brief usage notes or tips about the word/phrase"",
  ""difficulty"": Integer representing difficulty level (0=Basic, 1=Intermediate, 2=Advanced)
}

RULES:
1. Create accurate Lithuanian flashcards with correct grammar and spelling
2. Focus on the requested topic
3. Include common, useful vocabulary appropriate for the specified difficulty level
4. Provide realistic, practical example sentences
5. Add helpful context notes for language learners
6. DO NOT create flashcards that are similar to the existing ones provided in the prompt
7. Each flashcard should be unique and different from any existing ones
8. ALWAYS set the ""difficulty"" property to match the requested difficulty level

DIFFICULTY GUIDELINES:
- Basic (0): 
  * Common, everyday words and phrases (e.g., labas, ačiū, namas, eiti, būti)
  * Regular conjugation patterns and simple present tense for verbs
  * High-frequency vocabulary found in beginner textbooks
  * Words with transparent meaning and regular spelling

- Intermediate (1):
  * Less common vocabulary not encountered in everyday basic conversations
  * Irregular verbs or those with challenging conjugation patterns
  * Words with multiple context-dependent meanings
  * Compound words, prefixed/suffixed forms of basic vocabulary
  * Perfect and future tense verb forms

- Advanced (2):
  * Specialized/technical/literary vocabulary
  * Archaic terms, idioms, and culturally-specific expressions
  * Complex grammatical forms (subjunctive, passive constructions)
  * Abstract concepts and words rarely used in everyday speech
  * Words with subtle connotations or specialized usage contexts

EXAMPLES BY CATEGORY:
- Verbs: 
  * Basic: būti (to be), eiti (to go), turėti (to have), norėti (to want)
  * Intermediate: pasitikėti (to trust), įgyvendinti (to implement), svarstyti (to consider)
  * Advanced: puoselėti (to nurture), įžvelgti (to discern), išsklaidyti (to disperse)

CAPITALIZATION STANDARDS:
- For Lithuanian words in the ""frontWord"" field:
  * Capitalize proper nouns (names of people, places, etc.)
  * Use lowercase for common nouns, verbs, adjectives, and other parts of speech
  * This follows standard Lithuanian orthography rules
- For example sentences, follow standard Lithuanian capitalization rules (capitalize first letter of sentences)
- For English translations in ""backWord"", use lowercase unless the word is a proper noun
- Ensure consistency across all flashcards

EXAMPLE OUTPUT:
[
  {
    ""frontWord"": ""labas"",
    ""backWord"": ""hello"",
    ""exampleSentence"": ""Labas, kaip sekasi?"",
    ""exampleSentenceTranslation"": ""Hello, how are you?"",
    ""notes"": ""Used as a general greeting. Can be used at any time of day."",
    ""difficulty"": 0
  },
  {
    ""frontWord"": ""susitikimas"",
    ""backWord"": ""meeting"",
    ""exampleSentence"": ""Šiandien turiu svarbų susitikimą su klientu."",
    ""exampleSentenceTranslation"": ""Today I have an important meeting with a client."",
    ""notes"": ""Used in professional contexts for scheduled gatherings."",
    ""difficulty"": 1
  },
  {
    ""frontWord"": ""įžvalgumas"",
    ""backWord"": ""perceptiveness"",
    ""exampleSentence"": ""Jo įžvalgumas leido jam numatyti rinkos pokyčius."",
    ""exampleSentenceTranslation"": ""His perceptiveness allowed him to anticipate market changes."",
    ""notes"": ""Abstract concept used to describe insightful thinking or foresight."",
    ""difficulty"": 2
  }
]

IMPORTANT:
- Ensure all JSON properties are properly quoted
- Include all required fields for each flashcard
- Make example sentences natural and practical
- Keep notes concise but informative
- Avoid creating flashcards with similar words or phrases to existing ones
- Maintain consistent capitalization according to the standards above
- SET THE DIFFICULTY PROPERTY TO MATCH THE REQUESTED DIFFICULTY LEVEL";

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
    private bool ValidateGeneratedFlashcards(List<FlashcardResponse> flashcards)
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
    /// <param name="request">The parameters for flashcard generation, including description and count</param>
    /// <param name="existingWords">Optional existing words to avoid in the generated flashcards</param>
    /// <returns>A list of generated flashcards</returns>
    /// <exception cref="ArgumentNullException">Thrown when request is null</exception>
    /// <exception cref="InvalidOperationException">Thrown when AI response is invalid or empty</exception>
    public async Task<List<FlashcardResponse>> GenerateFlashcardsAsync(FlashcardRequest request, IEnumerable<string>? existingWords = null)
    {
        if (request == null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        return await RetryWithBackoffAsync(async (attempt) =>
        {
            _logger.LogInformation("Generating flashcards with AI for topic '{Topic}' with difficulty '{Difficulty}', attempt {Attempt}", 
                request.Topic, request.Difficulty, attempt);

            var prompt = new StringBuilder()
                .AppendLine($"Create {request.Count} Lithuanian language flashcards.")
                .AppendLine($"Topic: {request.Topic}")
                .AppendLine($"Difficulty: {request.Difficulty}");
                
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

            var flashcards = JsonSerializer.Deserialize<List<FlashcardResponse>>(
                jsonContent,
                new JsonSerializerOptions { 
                    PropertyNameCaseInsensitive = true,
                    AllowTrailingCommas = true,
                    ReadCommentHandling = JsonCommentHandling.Skip
                }
            );

            if (flashcards == null || !flashcards.Any() || !ValidateGeneratedFlashcards(flashcards))
            {
                throw new InvalidOperationException("Generated flashcards failed validation");
            }

            // Generate IDs and set topic for each flashcard
            foreach (var flashcard in flashcards)
            {
                flashcard.Id = Guid.NewGuid();
                flashcard.Topic = request.Topic; // Ensure topic is set correctly
            }

            // Limit to the requested count
            var limitedFlashcards = flashcards.Take(request.Count).ToList();

            _logger.LogInformation("Successfully generated {Count} flashcards for topic '{Topic}'", 
                limitedFlashcards.Count, request.Topic);

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