using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Lithuaningo.API.Services.AI;

// Helper records for Gemini API interaction
internal record GeminiPart([property: JsonPropertyName("text")] string Text);
internal record GeminiContent(
    [property: JsonPropertyName("parts")] List<GeminiPart> Parts,
    [property: JsonPropertyName("role")] string? Role = null); // Role is optional, used in chat
internal record GeminiSafetyRating(string Category, string Probability);
internal record GeminiCandidate(GeminiContent Content, List<GeminiSafetyRating>? SafetyRatings = null, string? FinishReason = null);
internal record GeminiGenerationConfig(
    [property: JsonPropertyName("candidateCount")] int? CandidateCount = null,
    [property: JsonPropertyName("maxOutputTokens")] int? MaxOutputTokens = null,
    [property: JsonPropertyName("temperature")] double? Temperature = null,
    [property: JsonPropertyName("topP")] double? TopP = null,
    [property: JsonPropertyName("stopSequences")] List<string>? StopSequences = null
);
internal record GeminiTextRequest(
    [property: JsonPropertyName("contents")] List<GeminiContent> Contents,
    [property: JsonPropertyName("generationConfig")] GeminiGenerationConfig? GenerationConfig = null
);
internal record GeminiTextResponse(List<GeminiCandidate> Candidates, object? PromptFeedback = null); // PromptFeedback can be complex, using object for now 