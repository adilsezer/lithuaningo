namespace Lithuaningo.API.Services.AI;

// Helper records for Gemini API interaction
internal record GeminiPart(string Text);
internal record GeminiContent(List<GeminiPart> Parts, string? Role = null); // Role is optional, used in chat
internal record GeminiSafetyRating(string Category, string Probability);
internal record GeminiCandidate(GeminiContent Content, List<GeminiSafetyRating>? SafetyRatings = null, string? FinishReason = null);
internal record GeminiGenerationConfig(int? CandidateCount = null, int? MaxOutputTokens = null, double? Temperature = null, double? TopP = null, List<string>? StopSequences = null);
internal record GeminiTextRequest(List<GeminiContent> Contents, GeminiGenerationConfig? GenerationConfig = null);
internal record GeminiTextResponse(List<GeminiCandidate> Candidates, object? PromptFeedback = null); // PromptFeedback can be complex, using object for now 