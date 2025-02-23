using Lithuaningo.API.Controllers;
using Lithuaningo.API.Services;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Services.Storage;
using Lithuaningo.API.Settings;
using Lithuaningo.API.Filters;
using Lithuaningo.API.Swagger;
using Microsoft.AspNetCore.Http.Features;
using Lithuaningo.API.Mappings;
using FluentValidation;
using FluentValidation.AspNetCore;
using Lithuaningo.API.Middleware;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Services.Cache;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Lithuaningo.API.Services.Auth;
using System.Text;

// TODO: Add HTTPS to the API when deploying to production

var builder = WebApplication.CreateBuilder(args);

// Configure Data Protection
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "keys")))
    .SetApplicationName("Lithuaningo")
    .UseCryptographicAlgorithms(new AuthenticatedEncryptorConfiguration()
    {
        EncryptionAlgorithm = EncryptionAlgorithm.AES_256_CBC,
        ValidationAlgorithm = ValidationAlgorithm.HMACSHA256
    });

// Configure caching
builder.Services.Configure<CacheSettings>(builder.Configuration.GetSection("CacheSettings"));
builder.Services.AddMemoryCache(); // Use in-memory cache instead of Redis
builder.Services.AddScoped<ICacheService, InMemoryCacheService>();

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
    cfg.AddProfile<DeckMappingProfile>();    // Deck-related mappings
    cfg.AddProfile<FlashcardMappingProfile>();// Flashcard-related mappings
    cfg.AddProfile<MiscMappingProfile>();    // Miscellaneous mappings
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

    if (!builder.Environment.IsDevelopment())
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

// Configure the HTTP request pipeline with security middleware
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
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

// Add startup message before RunAsync
if (app.Environment.IsDevelopment())
{
    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine("🚀 Server successfully started at http://localhost:7016");
    Console.ResetColor();
}
else
{
    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine("🚀 Server successfully started at https://localhost:7016");
    Console.ResetColor();
}

await app.RunAsync();

// Service Configuration
void ConfigureServices(IServiceCollection services, IConfiguration configuration)
{
    // Basic Services
    services.AddControllers();
    services.AddEndpointsApiExplorer();
    // API Versioning
    services.AddApiVersioning(options =>
    {
        options.DefaultApiVersion = new ApiVersion(1, 0);
        options.AssumeDefaultVersionWhenUnspecified = true;
        options.ReportApiVersions = true;
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
    services.AddScoped<IStorageConfiguration, StorageConfiguration>();
    services.AddScoped<IStorageService, StorageService>();

    // Core Services
    services.AddScoped<IUserProfileService, UserProfileService>();
    services.AddScoped<IUserFlashcardStatsService, UserFlashcardStatsService>();
    services.AddScoped<IAnnouncementService, AnnouncementService>();
    services.AddScoped<IAppInfoService, AppInfoService>();
    services.AddScoped<IDeckService, DeckService>();
    services.AddScoped<IDeckVoteService, DeckVoteService>();
    services.AddScoped<IFlashcardService, FlashcardService>();
    services.AddScoped<IDeckCommentService, DeckCommentService>();
    services.AddScoped<IDeckReportService, DeckReportService>();
    services.AddScoped<ILeaderboardService, LeaderboardService>();
    services.AddScoped<IUserChallengeStatsService, UserChallengeStatsService>();
    // Quiz Related Services
    services.AddScoped<IQuizService, QuizService>();

    // CORS Configuration with secure defaults
    services.Configure<CorsSettings>(configuration.GetSection("CorsSettings"));
    var corsSettings = configuration.GetSection("CorsSettings").Get<CorsSettings>();

    services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins(corsSettings?.AllowedOrigins ?? Array.Empty<string>())
                  .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                  .WithHeaders("Authorization", "Content-Type", "X-XSRF-TOKEN")
                  .AllowCredentials()
                  .SetIsOriginAllowedToAllowWildcardSubdomains()
                  .WithExposedHeaders("X-XSRF-TOKEN");
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
    .AddApplicationPart(typeof(QuizController).Assembly)
    .AddApplicationPart(typeof(AnnouncementController).Assembly)
    .AddApplicationPart(typeof(AppInfoController).Assembly)
    .AddApplicationPart(typeof(DeckController).Assembly)
    .AddApplicationPart(typeof(FlashcardController).Assembly)
    .AddApplicationPart(typeof(UserFlashcardStatsController).Assembly)
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
                ClockSkew = TimeSpan.FromMinutes(5)
            };

            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                    {
                        context.Response.Headers["Token-Expired"] = "true";
                    }
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
        // Enforce HTTPS in production
        app.UseHttpsRedirection();
    }

    app.UseCors("AllowFrontend");
    app.UseAuthorization();
    app.MapControllers();
}