using System.Security.Cryptography.X509Certificates;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Lithuaningo.API.Controllers;
using Lithuaningo.API.Mappings;
using Lithuaningo.API.Middleware;
using Lithuaningo.API.Services.AI;
using Lithuaningo.API.Services.AppInfo;
using Lithuaningo.API.Services.Auth;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Challenges;
using Lithuaningo.API.Services.Flashcards;
using Lithuaningo.API.Services.Leaderboard;
using Lithuaningo.API.Services.RevenueCat;
using Lithuaningo.API.Services.Stats;
using Lithuaningo.API.Services.Storage;
using Lithuaningo.API.Services.Subscription;
using Lithuaningo.API.Services.Supabase;
using Lithuaningo.API.Services.UserProfile;
using Lithuaningo.API.Settings;
using Lithuaningo.API.Swagger;
using Lithuaningo.API.Utilities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using OpenAI;

var builder = WebApplication.CreateBuilder(args);

// Load production secrets from environment variables
builder.AddProductionSecrets();

// Map specific environment variables to configuration keys
if (builder.Environment.IsProduction())
{
    // Map RevenueCat specific environment variables
    if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("REVENUECAT_WEBHOOK_AUTH_HEADER")))
    {
        builder.Configuration["RevenueCat:WebhookAuthHeader"] =
            Environment.GetEnvironmentVariable("REVENUECAT_WEBHOOK_AUTH_HEADER");
    }
}

// Validate configuration
ValidateConfiguration(builder.Configuration, builder.Environment);

// Configure Data Protection
var dataProtection = builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "keys")))
    .SetApplicationName("Lithuaningo")
    .UseCryptographicAlgorithms(new AuthenticatedEncryptorConfiguration()
    {
        EncryptionAlgorithm = EncryptionAlgorithm.AES_256_CBC,
        ValidationAlgorithm = ValidationAlgorithm.HMACSHA256
    });

// Try to protect with certificate if available
var certificate = LoadCertificate(builder.Environment, builder.Configuration);
if (certificate != null)
{
    dataProtection.ProtectKeysWithCertificate(certificate);
}

// Helper method to load certificate with proper error handling
static X509Certificate2? LoadCertificate(IWebHostEnvironment environment, IConfiguration configuration)
{
    try
    {
        // Try environment variable first for secure certificate password storage
        var certPassword = Environment.GetEnvironmentVariable("LITHUANINGO_CERT_PASSWORD");

        // Fall back to configuration if not found in environment
        if (string.IsNullOrEmpty(certPassword))
        {
            certPassword = configuration["DataProtection:CertificatePassword"];
        }

        var certificatePath = Path.Combine(environment.ContentRootPath, "config", "certificate.pfx");

        // Check if certificate file exists before trying to load it
        if (!File.Exists(certificatePath))
        {
            Console.WriteLine($"Certificate file not found at {certificatePath}. Skipping certificate protection.");
            return null;
        }

        if (!string.IsNullOrEmpty(certPassword))
        {
            return new X509Certificate2(certificatePath, certPassword,
                X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet | X509KeyStorageFlags.Exportable);
        }

        // Try loading without password
        return new X509Certificate2(certificatePath,
            string.Empty,
            X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet | X509KeyStorageFlags.Exportable);
    }
    catch (Exception ex)
    {
        // Log the error but don't crash the application
        Console.WriteLine($"Failed to load certificate: {ex.Message}. Data protection keys will not be protected with a certificate.");
        return null;
    }
}

// Configure caching
builder.Services.AddMemoryCache(); // Use in-memory cache instead of Redis
// Change Scoped to Singleton for cache services to ensure a single instance
builder.Services.AddSingleton<ICacheService, InMemoryCacheService>();
builder.Services.AddSingleton<CacheInvalidator>(); // Register the cache invalidator as Singleton
builder.Services.AddSingleton<ICacheSettingsService, CacheSettingsService>(); // Register the cache settings service as Singleton

// Use NewtonsoftJson instead of the default System.Text.Json with secure settings
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        // Prevent JSON hijacking
        options.SerializerSettings.TypeNameHandling = Newtonsoft.Json.TypeNameHandling.None;
    });

// Add services to the container.
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<UserMappingProfile>();    // User-related mappings
    cfg.AddProfile<AppInfoMappingProfile>();  // App info mappings
    cfg.AddProfile<UserChallengeStatsMappingProfile>();  // User challenge stats mappings
    cfg.AddProfile<ChallengeMappingProfile>();  // Challenge mappings
    cfg.AddProfile<LeaderboardMappingProfile>();  // Leaderboard mappings
    cfg.AddProfile<FlashcardMappingProfile>(); // Flashcard mappings
    cfg.AddProfile<UserFlashcardStatMappingProfile>(); // User flashcard stat mappings
    cfg.AddProfile<UserChatStatsMappingProfile>(); // User chat stats mappings
});

builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation()
    .AddFluentValidationClientsideAdapters()
    .AddValidatorsFromAssemblyContaining<Program>();

// Configure Antiforgery with secure defaults
builder.Services.AddAntiforgery(options =>
{
    options.Cookie.Name = "__Host-XSRF-TOKEN"; // __Host prefix for enhanced security
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.HttpOnly = true; // Prevent XSS from accessing the cookie
    options.HeaderName = "X-XSRF-TOKEN";
    // Ignore antiforgery token validation for API endpoints
    options.SuppressXFrameOptionsHeader = true;
});

// Configure request size limits
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 10 * 1024 * 1024; // 10MB
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB
    options.ValueLengthLimit = 10 * 1024 * 1024; // 10MB
    options.MultipartHeadersLengthLimit = 32 * 1024; // 32KB
});

// Configure Kestrel with security settings
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10MB
    serverOptions.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(30);
    serverOptions.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
    serverOptions.Limits.MaxConcurrentConnections = 100;
    serverOptions.Limits.MaxConcurrentUpgradedConnections = 100;
    serverOptions.Limits.MinRequestBodyDataRate = new Microsoft.AspNetCore.Server.Kestrel.Core.MinDataRate(
        bytesPerSecond: 100, gracePeriod: TimeSpan.FromSeconds(10));

    // Only configure HTTPS options if not running in Azure App Service
    // Azure App Service handles SSL termination at the load balancer level
    if (!builder.Environment.IsDevelopment() && string.IsNullOrEmpty(Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME")))
    {
        // Configure HTTPS options for production
        serverOptions.ConfigureHttpsDefaults(httpsOptions =>
        {
            httpsOptions.SslProtocols = System.Security.Authentication.SslProtocols.Tls12 |
                                     System.Security.Authentication.SslProtocols.Tls13;
        });
    }
});

ConfigureServices(builder.Services, builder.Configuration);

var app = builder.Build();

// Configure forwarded headers for Azure App Service
if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME")))
{
    app.UseForwardedHeaders(new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
    });
}

// Configure the HTTP request pipeline with security middleware
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();

    // Only use HTTPS redirection if not running in Azure App Service
    // Azure App Service handles HTTPS termination at the load balancer level
    if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME")))
    {
        app.UseHttpsRedirection();
    }
}

app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseMiddleware<RateLimitingMiddleware>();
app.UseMiddleware<RequestSizeMiddleware>();
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

// Add authentication before authorization
app.UseAuthentication();
app.UseAuthorization();

ConfigureMiddleware(app);

// Initialize Supabase with secure connection
using (var scope = app.Services.CreateScope())
{
    var supabaseService = scope.ServiceProvider.GetRequiredService<ISupabaseService>();
    await supabaseService.InitializeAsync();
}

Console.WriteLine("🚀 Server successfully started!");

await app.RunAsync();

// Service Configuration
void ConfigureServices(IServiceCollection services, IConfiguration configuration)
{
    // Application Insights
    services.AddApplicationInsightsTelemetry();

    // Health Checks
    services.AddHealthChecks();

    // Configure AI services
    services.AddSingleton<OpenAIClient>(sp =>
    {
        var aiSettings = sp.GetRequiredService<IOptions<AISettings>>().Value;
        return new OpenAIClient(aiSettings.OpenAIApiKey);
    });

    // Basic Services
    services.AddControllers();
    services.AddEndpointsApiExplorer();
    // Register Random as a singleton to ensure thread safety
    services.AddSingleton<Random>(sp => new Random());

    // Add RevenueCat webhook configuration
    services.Configure<RevenueCatSettings>(configuration.GetSection("RevenueCat"));

    // API Versioning
    services.AddApiVersioning(options =>
    {
        options.DefaultApiVersion = new ApiVersion(1, 0);
        options.AssumeDefaultVersionWhenUnspecified = true;
        options.ReportApiVersions = true;
        // Add support for multiple versioning methods
        options.ApiVersionReader = Microsoft.AspNetCore.Mvc.Versioning.ApiVersionReader.Combine(
            new Microsoft.AspNetCore.Mvc.Versioning.UrlSegmentApiVersionReader(),
            new Microsoft.AspNetCore.Mvc.Versioning.QueryStringApiVersionReader("api-version"),
            new Microsoft.AspNetCore.Mvc.Versioning.HeaderApiVersionReader("X-Version")
        );
    });

    services.AddVersionedApiExplorer(options =>
    {
        options.GroupNameFormat = "'v'VVV";
        options.SubstituteApiVersionInUrl = true;
    });

    // Configure Swagger with security
    services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "Lithuaningo API v1",
            Version = "v1",
            Description = @"Version 1 of the Lithuaningo API for the Lithuanian language learning platform.

## Authentication
To authorize in Swagger UI:
1. Get a JWT token from Supabase (in development):
   ```javascript
   const token = (await supabase.auth.getSession()).data.session?.access_token
   ```
2. Click 'Authorize' button at the top
3. Enter token as: Bearer your_token_here
4. Click 'Authorize'",
            Contact = new Microsoft.OpenApi.Models.OpenApiContact
            {
                Name = "Lithuaningo Team",
                Email = "support@lithuaningo.com",
                Url = new Uri("https://lithuaningo.com")
            },
            License = new Microsoft.OpenApi.Models.OpenApiLicense
            {
                Name = "Proprietary",
                Url = new Uri("https://lithuaningo.com/terms")
            }
        });

        c.SwaggerDoc("v2", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "Lithuaningo API v2",
            Version = "v2",
            Description = "Version 2 of the Lithuaningo API with enhanced features and optimizations",
            Contact = new Microsoft.OpenApi.Models.OpenApiContact
            {
                Name = "Lithuaningo Team",
                Email = "support@lithuaningo.com",
                Url = new Uri("https://lithuaningo.com")
            },
            License = new Microsoft.OpenApi.Models.OpenApiLicense
            {
                Name = "Proprietary",
                Url = new Uri("https://lithuaningo.com/terms")
            }
        });

        // Set the comments path for the Swagger JSON and UI
        var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
        {
            c.IncludeXmlComments(xmlPath);
        }

        // Add security definitions and requirements
        c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
            Name = "Authorization",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference
                    {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });

        // Enable annotations for additional documentation
        c.EnableAnnotations();

        // Organize actions by controller name
        c.TagActionsBy(api => new[] { api.GroupName ?? api.ActionDescriptor.RouteValues["controller"] });

        // Order the controllers
        c.OrderActionsBy(apiDesc => $"{apiDesc.ActionDescriptor.RouteValues["controller"]}_{apiDesc.RelativePath}");

        c.OperationFilter<SwaggerDefaultValues>();
    });

    // Supabase Configuration
    services.AddSingleton<ISupabaseConfiguration, SupabaseConfiguration>();
    services.AddSingleton<ISupabaseService, SupabaseService>();

    // Storage Configuration with secure defaults
    services.Configure<StorageSettings>(configuration.GetSection("Storage"));
    services.AddSingleton<IStorageConfiguration, StorageConfiguration>();
    services.AddSingleton<IStorageService, StorageService>();

    // Core Services
    services.AddScoped<IUserProfileService, UserProfileService>();
    services.AddScoped<IAppInfoService, AppInfoService>();
    services.AddScoped<IFlashcardService, FlashcardService>();
    services.AddScoped<IUserFlashcardStatService, UserFlashcardStatService>();
    services.AddScoped<ILeaderboardService, LeaderboardService>();
    services.AddScoped<IUserChallengeStatsService, UserChallengeStatsService>();
    services.AddScoped<IUserChatStatsService, UserChatStatsService>();
    services.AddScoped<ISubscriptionService, SubscriptionService>();
    // Challenge Related Services
    services.AddScoped<IChallengeService, ChallengeService>();
    services.AddScoped<IRevenueCatWebhookService, RevenueCatWebhookService>();

    // AI Services (formerly OpenAI Services)
    services.AddOptions<AISettings>() // Changed from OpenAISettings
        .Bind(configuration.GetSection(AISettings.SectionName)) // Changed from OpenAISettings.SectionName
        .ValidateDataAnnotations()
        .ValidateOnStart();
    services.AddScoped<IAIService, AIService>();

    // CORS Configuration with secure defaults
    services.Configure<CorsSettings>(configuration.GetSection("CorsSettings"));
    var corsSettings = configuration.GetSection("CorsSettings").Get<CorsSettings>();

    services.AddCors(options =>
    {
        // Mobile app CORS policy - Secure approach for React Native apps
        // Mobile apps can be identified by their User-Agent or custom headers
        // This approach validates requests without allowing all origins
        options.AddPolicy("AllowMobile", policy =>
        {
            policy.SetIsOriginAllowed(origin =>
                  {
                      // Allow mobile apps (they typically don't send an Origin header or send 'null')
                      // Allow localhost for development
                      // Allow specific production origins
                      return string.IsNullOrEmpty(origin) ||
                             origin == "null" ||
                             origin.StartsWith("http://localhost") ||
                             origin.StartsWith("https://localhost") ||
                             (corsSettings?.AllowedOrigins?.Contains(origin) ?? false);
                  })
                  .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                  .WithHeaders("Authorization", "Content-Type", "X-XSRF-TOKEN", "User-Agent", "X-Mobile-App")
                  .WithExposedHeaders("Token-Expired", "X-XSRF-TOKEN")
                  .AllowCredentials();
        });

        // Web frontend CORS policy - for browser clients with specific origins
        options.AddPolicy("AllowWebFrontend", policy =>
        {
            policy.WithOrigins(corsSettings?.AllowedOrigins ?? Array.Empty<string>())
                  .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                  .WithHeaders("Authorization", "Content-Type", "X-XSRF-TOKEN")
                  .AllowCredentials()
                  .SetIsOriginAllowedToAllowWildcardSubdomains()
                  .WithExposedHeaders("Token-Expired", "X-XSRF-TOKEN");
        });
    });

    // Configure MVC with security features
    services.AddControllers(options =>
    {
        // Require HTTPS only in production
        if (!builder.Environment.IsDevelopment())
        {
            options.Filters.Add(new RequireHttpsAttribute());
        }
        // Add security headers
        options.Filters.Add(new ResponseCacheAttribute { NoStore = true, Location = ResponseCacheLocation.None });
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        // Customize bad request responses
        options.InvalidModelStateResponseFactory = context =>
        {
            var problemDetails = new ValidationProblemDetails(context.ModelState)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "One or more validation errors occurred.",
                Instance = context.HttpContext.Request.Path
            };
            return new BadRequestObjectResult(problemDetails);
        };
    })
    .AddApplicationPart(typeof(UserProfileController).Assembly)
    .AddApplicationPart(typeof(ChallengeController).Assembly)
    .AddApplicationPart(typeof(AppInfoController).Assembly)
    .AddApplicationPart(typeof(FlashcardController).Assembly)
    .AddApplicationPart(typeof(UserFlashcardStatsController).Assembly)
    .AddApplicationPart(typeof(UserChatStatsController).Assembly)
    .AddApplicationPart(typeof(StorageService).Assembly);

    // Add Authentication Services
    services.AddScoped<IAuthService, AuthService>();

    // Add JWT Authentication
    services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            var supabaseSettings = configuration.GetSection("Supabase").Get<SupabaseSettings>();
            if (supabaseSettings == null)
            {
                throw new InvalidOperationException("Supabase settings not found in configuration");
            }

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = $"{supabaseSettings.Url}/auth/v1",
                ValidAudience = "authenticated",
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(supabaseSettings.JwtSecret)),
                // Keep the same clock skew as in AuthService
                ClockSkew = TimeSpan.FromMinutes(5),
                // Standard validation settings
                RequireSignedTokens = true,
                RequireExpirationTime = true,
                NameClaimType = "sub", // Default claim for user name
                RoleClaimType = "role" // Default claim for role
            };

            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                    {
                        context.Response.Headers["Token-Expired"] = "true";
                    }

                    // Log only essential info about authentication failure
                    var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<JwtBearerEvents>>();
                    logger.LogWarning("JWT authentication failed: {Message}", context.Exception.Message);

                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    // Simply log successful validation without all the claims
                    var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<JwtBearerEvents>>();
                    logger.LogDebug("JWT token successfully validated");
                    return Task.CompletedTask;
                }
            };
        });
}

void ConfigureMiddleware(WebApplication app)
{
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger(c =>
        {
            c.PreSerializeFilters.Add((swaggerDoc, httpReq) =>
            {
                swaggerDoc.Servers = new List<Microsoft.OpenApi.Models.OpenApiServer>
                {
                    new() { Url = $"{httpReq.Scheme}://{httpReq.Host.Value}" }
                };
            });
        });
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Lithuaningo API v1");
            c.SwaggerEndpoint("/swagger/v2/swagger.json", "Lithuaningo API v2");
            c.EnableDeepLinking();
            c.DisplayRequestDuration();
        });
    }
    else
    {
        // Only enforce HTTPS redirection if not running in Azure App Service
        // Azure App Service handles HTTPS termination at the load balancer level
        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME")))
        {
            app.UseHttpsRedirection();
        }
    }

    // Use different CORS policies based on environment
    if (app.Environment.IsDevelopment())
    {
        // Use web frontend policy in development for easier debugging with specific origins
        app.UseCors("AllowWebFrontend");
    }
    else
    {
        // Use mobile-friendly policy in production
        // INTENTIONAL: AllowMobile policy uses AllowAnyOrigin() for React Native compatibility
        // This is a standard practice for mobile APIs as mobile apps don't have fixed origins
        app.UseCors("AllowMobile");
    }

    app.UseAuthorization();
    app.MapControllers();

    // Add health check endpoint
    app.MapHealthChecks("/health");
}

void ValidateConfiguration(IConfiguration configuration, IWebHostEnvironment environment)
{
    if (!environment.IsDevelopment())
    {
        // Critical production settings to validate
        var criticalSettings = new Dictionary<string, string>
        {
            { "Supabase:Url", "Supabase URL" },
            { "Supabase:ServiceKey", "Supabase service key" },
            { "Supabase:JwtSecret", "JWT secret" },
            { "AI:OpenAIApiKey", "OpenAI API key" },
            { "AI:OpenAITextModelName", "OpenAI Text Model Name" },
            { "AI:OpenAIImageModelName", "OpenAI Image Model Name" },
            { "AI:OpenAIAudioModelName", "OpenAI Audio Model Name" },
            { "RevenueCat:WebhookAuthHeader", "RevenueCat Webhook Auth Header" }
        };

        foreach (var setting in criticalSettings)
        {
            var value = configuration[setting.Key];

            // Special validation for model names that can be shorter
            var isModelNameSetting = setting.Key.Contains("ModelName");
            var minLength = isModelNameSetting ? 3 : 10; // Model names can be as short as 3 chars (e.g., "tts-1")

            if (string.IsNullOrWhiteSpace(value) || value.Contains("YOUR_") || value.Length < minLength)
            {
                throw new InvalidOperationException($"Missing or invalid configuration for {setting.Value}. " +
                    $"Please set environment variable or update configuration.");
            }
        }

        // Log a warning instead of failing if certificate password is missing
        var certPassword = configuration["DataProtection:CertificatePassword"];
        if (string.IsNullOrWhiteSpace(certPassword))
        {
            Console.WriteLine("Warning: Certificate password not found. Data protection keys will not be protected with a certificate.");
        }
    }
}