using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Lithuaningo.API.Controllers;
using Lithuaningo.API.Services;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Services.Quiz;
using Lithuaningo.API.Services.Quiz.Factory;
using Lithuaningo.API.Services.Quiz.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    if (builder.Environment.IsDevelopment())
    {
        // Using HTTP for development
        serverOptions.ListenAnyIP(7016);
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("🚀 Server successfully started at http://localhost:7016");
        Console.ResetColor();
    }
    else
    {
        // Using HTTPS for production
        serverOptions.ListenAnyIP(7016, listenOptions =>
        {
            listenOptions.UseHttps();
        });
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("🚀 Server successfully started at https://localhost:7016");
        Console.ResetColor();
    }
});

ConfigureFirebase(builder.Configuration);

ConfigureServices(builder.Services, builder.Configuration);

var app = builder.Build();

ConfigureMiddleware(app);

await app.RunAsync();

// Firebase Configuration
void ConfigureFirebase(IConfiguration configuration)
{
    var firestoreSettings = configuration.GetSection("FirestoreSettings").Get<FirestoreSettings>();
    var credentialsPath = Path.Combine(Directory.GetCurrentDirectory(),
        firestoreSettings?.CredentialsPath ?? "credentials/firebase/serviceAccountKey.json");


    if (!File.Exists(credentialsPath))
    {
        throw new FileNotFoundException($"Firebase credentials file not found at: {credentialsPath}");
    }

    Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);

    if (FirebaseApp.DefaultInstance == null)
    {
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile(credentialsPath)
        });
    }
}

// Service Configuration
void ConfigureServices(IServiceCollection services, IConfiguration configuration)
{
    // Basic Services
    services.AddControllers();
    services.AddEndpointsApiExplorer();
    services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Lithuaningo API", Version = "v1" });
        
        // Configure Swagger to handle file uploads
        c.MapType<IFormFile>(() => new Microsoft.OpenApi.Models.OpenApiSchema
        {
            Type = "string",
            Format = "binary"
        });
    });

    // Configure file size limits
    services.Configure<FormOptions>(options =>
    {
        options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB
    });

    // Firebase Configuration
    services.Configure<FirestoreSettings>(configuration.GetSection("FirestoreSettings"));
    services.Configure<FirestoreCollectionSettings>(configuration.GetSection("FirestoreCollectionSettings"));
    var firestoreSettings = configuration.GetSection("FirestoreSettings").Get<FirestoreSettings>();
    services.AddSingleton(FirestoreDb.Create(firestoreSettings?.ProjectId));

    // Core Services
    services.AddScoped<IUserService, UserService>();
    services.AddScoped<ISentenceService, SentenceService>();
    services.AddScoped<IWordService, WordService>();
    services.AddScoped<IAnnouncementService, AnnouncementService>();
    services.AddScoped<IAppInfoService, AppInfoService>();
    services.AddScoped<IDeckService, DeckService>();
    services.AddScoped<IFlashcardService, FlashcardService>();
    services.AddScoped<IPracticeService, PracticeService>();
    services.AddScoped<IStorageService, StorageService>();
    services.AddScoped<ICommentService, CommentService>();
    services.AddScoped<IReportService, ReportService>();
    
    // Quiz Related Services
    services.AddScoped<IQuizService, QuizService>();
    services.AddScoped<IQuestionGeneratorFactory, QuestionGeneratorFactory>();
    services.AddSingleton<IRandomGenerator, RandomGenerator>();

    // CORS Configuration
    services.Configure<CorsSettings>(configuration.GetSection("CorsSettings"));
    var corsSettings = configuration.GetSection("CorsSettings").Get<CorsSettings>();

    services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins(corsSettings?.AllowedOrigins ?? Array.Empty<string>())
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    services.AddControllers()
            .AddApplicationPart(typeof(UserController).Assembly)
            .AddApplicationPart(typeof(WordController).Assembly)
            .AddApplicationPart(typeof(SentenceController).Assembly)
            .AddApplicationPart(typeof(QuizController).Assembly)
            .AddApplicationPart(typeof(AnnouncementController).Assembly)
            .AddApplicationPart(typeof(AppInfoController).Assembly)
            .AddApplicationPart(typeof(DeckController).Assembly)
            .AddApplicationPart(typeof(FlashcardController).Assembly)
            .AddApplicationPart(typeof(PracticeController).Assembly)
            .AddApplicationPart(typeof(StorageService).Assembly);

    builder.Services.Configure<StorageSettings>(
        builder.Configuration.GetSection("StorageSettings"));
}

void ConfigureMiddleware(WebApplication app)
{
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }
    else
    {
        app.UseHttpsRedirection();
    }

    app.UseCors("AllowFrontend");
    app.UseAuthorization();
    app.MapControllers();
}