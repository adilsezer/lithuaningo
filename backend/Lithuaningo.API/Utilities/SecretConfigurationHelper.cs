using Microsoft.Extensions.Configuration;

namespace Lithuaningo.API.Utilities;

/// <summary>
/// Helper class to manage secrets in production using environment variables
/// </summary>
public static class SecretConfigurationHelper
{
    /// <summary>
    /// Configure application to use environment variables for secrets in production
    /// </summary>
    public static WebApplicationBuilder AddProductionSecrets(this WebApplicationBuilder builder)
    {
        if (builder.Environment.IsProduction())
        {
            // Map environment variables to configuration
            var envMappings = new Dictionary<string, string>
            {
                { "LITHUANINGO_SUPABASE_URL", "Supabase:Url" },
                { "LITHUANINGO_SUPABASE_ANON_KEY", "Supabase:AnonKey" },
                { "LITHUANINGO_SUPABASE_SERVICE_KEY", "Supabase:ServiceKey" },
                { "LITHUANINGO_SUPABASE_JWT_SECRET", "Supabase:JwtSecret" },
                { "LITHUANINGO_OPENAI_API_KEY", "AI:OpenAIApiKey" },
                { "LITHUANINGO_OPENAI_IMAGE_MODEL_NAME", "AI:OpenAIImageModelName" },
                { "LITHUANINGO_OPENAI_AUDIO_MODEL_NAME", "AI:OpenAIAudioModelName" },
                { "LITHUANINGO_STORAGE_R2_ACCESS_KEY_ID", "Storage:R2AccessKeyId" },
                { "LITHUANINGO_STORAGE_R2_ACCESS_KEY_SECRET", "Storage:R2AccessKeySecret" },
                { "LITHUANINGO_STORAGE_BUCKET_NAME", "Storage:BucketName" },
                { "LITHUANINGO_STORAGE_CUSTOM_DOMAIN", "Storage:CustomDomain" },
                { "LITHUANINGO_STORAGE_R2_ACCOUNT_ID", "Storage:R2AccountId" },
                { "REVENUECAT_WEBHOOK_AUTH_HEADER", "RevenueCat:WebhookAuthHeader" },
            };

            // Add environment variables to configuration
            foreach (var mapping in envMappings)
            {
                var envValue = Environment.GetEnvironmentVariable(mapping.Key);
                if (!string.IsNullOrEmpty(envValue))
                {
                    builder.Configuration[mapping.Value] = envValue;
                }
            }
        }

        return builder;
    }
}