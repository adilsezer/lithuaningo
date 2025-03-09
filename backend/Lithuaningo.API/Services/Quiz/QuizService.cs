using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;
using System.Text.Unicode;
using System.Threading.Tasks;
using AutoMapper;
using Lithuaningo.API.DTOs.Quiz;
using Lithuaningo.API.Models.Quiz;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Supabase;
using static Supabase.Postgrest.Constants;

namespace Lithuaningo.API.Services
{
    /// <summary>
    /// A service for generating and retrieving daily quiz questions.
    /// If no questions exist for today, they are automatically created.
    /// </summary>
    public class QuizService : IQuizService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "quiz:";
        private readonly ILogger<QuizService> _logger;
        private readonly IMapper _mapper;
        private readonly CacheInvalidator _cacheInvalidator;
        private readonly IAIService _aiService;

        public QuizService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<QuizService> logger,
            IMapper mapper,
            CacheInvalidator cacheInvalidator,
            IAIService aiService)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger;
            _mapper = mapper;
            _cacheInvalidator = cacheInvalidator;
            _aiService = aiService;
        }

        /// <summary>
        /// Retrieves quiz questions for the current day from Supabase.
        /// </summary>
        public async Task<IEnumerable<QuizQuestionResponse>> GetDailyQuizQuestionsAsync()
        {
            var today = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");
            var cacheKey = $"{CacheKeyPrefix}daily:{today}";
            var cached = await _cache.GetAsync<IEnumerable<QuizQuestionResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved daily quiz questions from cache for {Date}", today);
                return cached;
            }

            try
            {
                var todayDate = DateTime.Parse(today);
                var startOfDay = todayDate;
                var endOfDay = todayDate.AddDays(1).AddTicks(-1);

                var response = await _supabaseClient
                    .From<QuizQuestion>()
                    .Where(q => q.CreatedAt >= startOfDay && q.CreatedAt <= endOfDay)
                    .Get();

                var questions = response.Models;
                
                if (questions == null || !questions.Any())
                {
                    _logger.LogInformation("No quiz questions found for {Date}, generating new ones using AI", today);
                    return await GenerateQuizQuestionsUsingAIAsync();
                }
                
                var questionResponses = _mapper.Map<IEnumerable<QuizQuestionResponse>>(questions);

                await _cache.SetAsync(cacheKey, questionResponses,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved {Count} quiz questions for {Date}", questions.Count, today);

                return questionResponses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily quiz questions for {Date}", today);
                throw;
            }
        }

        private async Task<IEnumerable<QuizQuestionResponse>> GenerateQuizQuestionsUsingAIAsync()
        {
            try
            {
                // Define a more robust prompt for generating quiz questions
                var prompt = @"Your task is to generate 5 Lithuanian language quiz questions for our learning app.

FORMAT REQUIREMENTS: 
- Return a valid JSON array of quiz questions
- Do NOT include any explanations, comments, or markdown formatting like triple backticks
- Return ONLY the JSON array

EACH QUESTION MUST HAVE:
- question: A Lithuanian phrase or word with English translation in parentheses
- options: An array of exactly 4 possible answers in Lithuanian
- correctAnswer: The correct option (must match exactly one of the options)
- exampleSentence: An example usage in Lithuanian
- type: MUST be one of these EXACT values (no quotes): 0 for MultipleChoice, 1 for TrueFalse, 2 for FillInTheBlank

EXAMPLE OF EXPECTED JSON STRUCTURE (do not copy these examples, create new ones):
[
  {
    ""question"": ""Labas (Hello)"",
    ""options"": [""Labas"", ""Viso gero"", ""Ačiū"", ""Prašau""],
    ""correctAnswer"": ""Labas"",
    ""exampleSentence"": ""Labas, kaip sekasi?"",
    ""type"": 0
  },
  {
    ""question"": ""Ar tu kalbi lietuviškai? (Do you speak Lithuanian?)"",
    ""options"": [""Taip"", ""Ne""],
    ""correctAnswer"": ""Taip"",
    ""exampleSentence"": ""Ar tu kalbi lietuviškai? Taip, kalbu."",
    ""type"": 1
  },
  {
    ""question"": ""Aš esu (I am) ______."",
    ""options"": [""studentas"", ""mokytojas"", ""gydytojas"", ""inžinierius""],
    ""correctAnswer"": ""studentas"",
    ""exampleSentence"": ""Aš esu studentas universitete."",
    ""type"": 2
  }
]

CONTENT GUIDELINES:
- Focus on common Lithuanian phrases, vocabulary, and basic grammar
- Include a mix of greetings, daily expressions, and basic vocabulary
- Make questions appropriate for beginners to intermediate learners
- Ensure all text in Lithuanian uses correct characters and spelling";

                _logger.LogInformation("Sending AI request to generate quiz questions");
                
                // We'll retry AI generation up to 3 times if needed
                for (int attempt = 1; attempt <= 3; attempt++)
                {
                    try
                    {
                        // Call the AI service to generate quiz questions
                        var aiResponse = await _aiService.ProcessRequestAsync(prompt, serviceType: "chat");
                        _logger.LogInformation("Received AI response: {Length} characters on attempt {Attempt}", 
                            aiResponse?.Length ?? 0, attempt);
                        
                        if (string.IsNullOrEmpty(aiResponse))
                        {
                            _logger.LogWarning("AI returned empty response on attempt {Attempt}", attempt);
                            continue;
                        }

                        // Extract JSON content from potential markdown code blocks
                        var jsonContent = ExtractJsonFromAiResponse(aiResponse);
                        
                        // Convert string enum values to integers if needed
                        jsonContent = ConvertStringTypeToIntIfNeeded(jsonContent ?? string.Empty);

                        // Try standard deserialization first
                        List<CreateQuizQuestionRequest>? generatedQuestions = null;
                        try
                        {
                            // Parse the JSON response into quiz question models
                            generatedQuestions = JsonSerializer.Deserialize<List<CreateQuizQuestionRequest>>(
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
                            _logger.LogError(ex, "JSON deserialization error, trying alternate parsing approach");
                            
                            // Try to extract questions using a more lenient approach
                            try
                            {
                                generatedQuestions = ExtractQuestionsFromAiResponseFallback(jsonContent);
                                _logger.LogInformation("Fallback parsing {Status}", 
                                    generatedQuestions?.Any() == true ? "succeeded" : "failed");
                            }
                            catch (Exception extractEx)
                            {
                                _logger.LogError(extractEx, "Error in fallback question extraction");
                            }
                        }
                        
                        // Check if we have valid questions
                        if (generatedQuestions == null || !generatedQuestions.Any())
                        {
                            _logger.LogWarning("AI returned no valid questions on attempt {Attempt}", attempt);
                            continue;
                        }

                        // Validate the questions
                        if (!ValidateGeneratedQuestions(generatedQuestions))
                        {
                            _logger.LogWarning("AI returned invalid questions on attempt {Attempt}, trying again", attempt);
                            continue;
                        }

                        _logger.LogInformation("Successfully generated {Count} quiz questions on attempt {Attempt}", 
                            generatedQuestions.Count, attempt);

                        // Create the questions in the database
                        return await CreateDailyQuizQuestionsAsync(generatedQuestions);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing AI response on attempt {Attempt}", attempt);
                        // Continue to next attempt
                    }

                    // Wait a bit before retrying
                    await Task.Delay(1000);
                }

                // If we get here, all attempts failed
                throw new Exception("Failed to generate valid quiz questions after multiple attempts");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating quiz questions using AI");
                throw new Exception("Failed to generate quiz questions. Please try again later.", ex);
            }
        }

        /// <summary>
        /// Validates that generated questions meet our requirements
        /// </summary>
        private bool ValidateGeneratedQuestions(List<CreateQuizQuestionRequest> questions)
        {
            if (questions.Count < 3)
            {
                _logger.LogWarning("Too few questions generated: {Count}", questions.Count);
                return false;
            }

            foreach (var question in questions)
            {
                // Basic validation
                if (string.IsNullOrWhiteSpace(question.Question))
                {
                    _logger.LogWarning("Question text is empty");
                    return false;
                }

                if (question.Options == null || question.Options.Count < 2)
                {
                    _logger.LogWarning("Question has too few options: {Count}", question.Options?.Count ?? 0);
                    return false;
                }

                if (string.IsNullOrWhiteSpace(question.CorrectAnswer))
                {
                    _logger.LogWarning("Question has no correct answer");
                    return false;
                }

                // Ensure the correct answer is one of the options
                if (!question.Options.Contains(question.CorrectAnswer))
                {
                    _logger.LogWarning("Correct answer '{Answer}' is not in the options list", question.CorrectAnswer);
                    return false;
                }
            }

            return true;
        }

        /// <summary>
        /// Extracts JSON content from an AI response that might be wrapped in markdown code blocks.
        /// </summary>
        private string ExtractJsonFromAiResponse(string aiResponse)
        {
            if (string.IsNullOrEmpty(aiResponse))
            {
                throw new ArgumentException("AI response is empty or null");
            }

            // Log the original response for debugging
            _logger.LogDebug("Original AI response: {Response}", aiResponse);

            string jsonContent = aiResponse;

            // If response is wrapped in code blocks (```json ... ```)
            if (aiResponse.Contains("```"))
            {
                var codeBlockMatch = Regex.Match(
                    aiResponse,
                    @"```(?:json)?\s*\n?([\s\S]*?)\n?```",
                    RegexOptions.Singleline
                );

                if (codeBlockMatch.Success && codeBlockMatch.Groups.Count > 1)
                {
                    jsonContent = codeBlockMatch.Groups[1].Value?.Trim() ?? string.Empty;
                    _logger.LogDebug("Extracted JSON from code block: {Json}", jsonContent);
                }
            }

            // Remove any leading/trailing non-JSON characters
            // Look for the first '[' or '{' and the last ']' or '}'
            int startIndex = jsonContent.IndexOfAny(new[] { '[', '{' });
            int endIndex = jsonContent.LastIndexOfAny(new[] { ']', '}' });

            if (startIndex >= 0 && endIndex >= 0 && endIndex > startIndex)
            {
                jsonContent = jsonContent.Substring(startIndex, endIndex - startIndex + 1);
                _logger.LogDebug("Extracted JSON content: {Json}", jsonContent);
            }

            // Clean up common JSON formatting issues
            jsonContent = CleanupJsonContent(jsonContent ?? string.Empty);

            // Ensure the result is valid JSON
            ValidateJson(jsonContent ?? string.Empty);

            return jsonContent ?? string.Empty;
        }

        /// <summary>
        /// Fixes common JSON formatting issues in AI-generated content
        /// </summary>
        private string CleanupJsonContent(string jsonContent)
        {
            if (string.IsNullOrEmpty(jsonContent))
                return jsonContent;

            // Replace any escaped quotes that might be causing issues
            string cleanedContent = jsonContent.Replace("\\\"", "\"");
            
            // Make sure array brackets are properly balanced
            if (cleanedContent.StartsWith("[") && !cleanedContent.EndsWith("]"))
                cleanedContent += "]";
            
            if (cleanedContent.EndsWith("]") && !cleanedContent.StartsWith("["))
                cleanedContent = "[" + cleanedContent;

            // Fix trailing commas in arrays which are invalid in JSON
            cleanedContent = Regex.Replace(cleanedContent, @",(\s*[\]\}])", "$1");

            return cleanedContent;
        }

        /// <summary>
        /// Ensures the result is valid JSON
        /// </summary>
        private void ValidateJson(string jsonContent)
        {
            if (string.IsNullOrEmpty(jsonContent))
            {
                throw new ArgumentException("JSON content is empty or null");
            }

            try
            {
                // Just validate, we'll deserialize to proper type later
                using (JsonDocument.Parse(jsonContent ?? string.Empty))
                {
                    _logger.LogInformation("Successfully validated JSON content");
                }
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Extracted content is not valid JSON: {Content}", jsonContent);
                throw new JsonException("Failed to extract valid JSON from AI response", ex);
            }
        }

        /// <summary>
        /// Convert string type values to integer values if needed
        /// </summary>
        private string ConvertStringTypeToIntIfNeeded(string jsonContent)
        {
            if (string.IsNullOrEmpty(jsonContent))
            {
                return string.Empty;
            }

            try
            {
                // Parse the JSON into a JsonDocument for manipulation
                using (JsonDocument doc = JsonDocument.Parse(jsonContent ?? string.Empty))
                {
                    // Check if we need to convert string types to integers
                    bool needsConversion = false;
                    var jsonArray = doc.RootElement;
                    
                    if (jsonArray.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in jsonArray.EnumerateArray())
                        {
                            if (item.TryGetProperty("type", out var typeProperty) && 
                                typeProperty.ValueKind == JsonValueKind.String)
                            {
                                needsConversion = true;
                                break;
                            }
                        }
                    }

                    // If no conversion needed, return the original content
                    if (!needsConversion)
                    {
                        return jsonContent ?? string.Empty;
                    }

                    // Convert the JSON with string types to JSON with integer types
                    using (var stream = new MemoryStream())
                    {
                        using (var writer = new Utf8JsonWriter(stream))
                        {
                            writer.WriteStartArray();

                            foreach (var item in jsonArray.EnumerateArray())
                            {
                                writer.WriteStartObject();
                                
                                foreach (var prop in item.EnumerateObject())
                                {
                                    if (prop.Name.Equals("type", StringComparison.OrdinalIgnoreCase) && 
                                        prop.Value.ValueKind == JsonValueKind.String)
                                    {
                                        writer.WritePropertyName("type");
                                        string typeString = prop.Value.GetString() ?? "";
                                        
                                        // Convert string enum values to integers
                                        int typeValue = typeString switch
                                        {
                                            "MultipleChoice" => 0,
                                            "TrueFalse" => 1,
                                            "FillInTheBlank" => 2,
                                            _ => 0 // Default to MultipleChoice
                                        };
                                        
                                        writer.WriteNumberValue(typeValue);
                                    }
                                    else
                                    {
                                        prop.WriteTo(writer);
                                    }
                                }
                                
                                writer.WriteEndObject();
                            }
                            
                            writer.WriteEndArray();
                        }

                        var convertedJson = Encoding.UTF8.GetString(stream.ToArray());
                        _logger.LogDebug("Converted JSON: {Json}", convertedJson);
                        return convertedJson;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error converting string type values to integers, using original content");
                return jsonContent;
            }
        }

        /// <summary>
        /// Creates new quiz questions for the day.
        /// </summary>
        /// <param name="questions">The quiz questions to create</param>
        public async Task<IEnumerable<QuizQuestionResponse>> CreateDailyQuizQuestionsAsync(IEnumerable<CreateQuizQuestionRequest> questions)
        {
            if (questions == null)
            {
                throw new ArgumentNullException(nameof(questions));
            }

            if (!questions.Any())
            {
                throw new ArgumentException("Questions collection cannot be empty", nameof(questions));
            }

            try
            {
                var today = DateTime.UtcNow.Date;
                var quizQuestions = questions.Select(q => new QuizQuestion
                {
                    Id = Guid.NewGuid(),
                    Question = q.Question,
                    Options = q.Options,
                    CorrectAnswer = q.CorrectAnswer,
                    ExampleSentence = q.ExampleSentence,
                    Type = q.Type,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }).ToList();

                var response = await _supabaseClient
                    .From<QuizQuestion>()
                    .Insert(quizQuestions);

                // Replace direct cache removal with CacheInvalidator
                await _cacheInvalidator.InvalidateQuizCacheAsync();

                _logger.LogInformation("Created {Count} quiz questions for {Date}", 
                    quizQuestions.Count, today.ToString("yyyy-MM-dd"));

                return _mapper.Map<IEnumerable<QuizQuestionResponse>>(response.Models);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating quiz questions");
                throw;
            }
        }

        /// <summary>
        /// Gets quiz questions by category.
        /// </summary>
        public async Task<IEnumerable<QuizQuestionResponse>> GetQuizQuestionsByCategoryAsync(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
            {
                throw new ArgumentException("Category cannot be empty", nameof(category));
            }

            var cacheKey = $"{CacheKeyPrefix}category:{category.ToLowerInvariant()}";
            var cached = await _cache.GetAsync<IEnumerable<QuizQuestionResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved quiz questions from cache for category {Category}", category);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<QuizQuestion>()
                    .Where(q => q.Type.ToString().ToLower() == category.ToLowerInvariant())
                    .Get();

                var questions = response.Models;
                var questionResponses = _mapper.Map<IEnumerable<QuizQuestionResponse>>(questions);

                await _cache.SetAsync(cacheKey, questionResponses,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} quiz questions for category {Category}", 
                    questions.Count, category);

                return questionResponses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving quiz questions for category {Category}", category);
                throw;
            }
        }

        /// <summary>
        /// Fallback method to extract questions from AI response when JSON parsing fails
        /// </summary>
        private List<CreateQuizQuestionRequest> ExtractQuestionsFromAiResponseFallback(string jsonContent)
        {
            var questions = new List<CreateQuizQuestionRequest>();
            
            if (string.IsNullOrEmpty(jsonContent))
            {
                _logger.LogWarning("Cannot extract questions from empty content");
                return questions;
            }
            
            try
            {
                // Use regex to identify question blocks
                var questionPattern = new Regex(@"""question"":\s*""([^""]+)"",\s*""options"":\s*\[((?:"".+?"",?\s*)+)\],\s*""correctAnswer"":\s*""([^""]+)"",\s*""exampleSentence"":\s*""([^""]*)"",\s*""type"":\s*(?:"")?([a-zA-Z0-9]+)(?:"")?", 
                    RegexOptions.Singleline);
                
                var matches = questionPattern.Matches(jsonContent ?? string.Empty);
                
                foreach (Match match in matches)
                {
                    if (match.Groups.Count >= 6)
                    {
                        string question = match.Groups[1].Value ?? string.Empty;
                        string optionsString = match.Groups[2].Value ?? string.Empty;
                        string correctAnswer = match.Groups[3].Value ?? string.Empty;
                        string exampleSentence = match.Groups[4].Value ?? string.Empty;
                        string typeString = match.Groups[5].Value ?? string.Empty;
                        
                        // Parse options array
                        var optionsPattern = new Regex(@"""([^""]+)""");
                        var optionsMatches = optionsPattern.Matches(optionsString);
                        var options = optionsMatches.Select(m => m.Groups[1].Value ?? string.Empty).ToList();
                        
                        // Convert type string to enum
                        QuizQuestionType questionType = QuizQuestionType.MultipleChoice;
                        switch ((typeString ?? string.Empty).Trim().ToLowerInvariant())
                        {
                            case "multiplechoice":
                            case "0":
                                questionType = QuizQuestionType.MultipleChoice;
                                break;
                            case "truefalse":
                            case "1":
                                questionType = QuizQuestionType.TrueFalse;
                                break;
                            case "fillintheblanK":
                            case "2":
                                questionType = QuizQuestionType.FillInTheBlank;
                                break;
                        }
                        
                        // Create a question
                        var quizQuestion = new CreateQuizQuestionRequest
                        {
                            Question = question,
                            Options = options,
                            CorrectAnswer = correctAnswer,
                            ExampleSentence = exampleSentence,
                            Type = questionType
                        };
                        
                        questions.Add(quizQuestion);
                    }
                }
                
                return questions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting questions with fallback method");
                return new List<CreateQuizQuestionRequest>();
            }
        }
    }
}
