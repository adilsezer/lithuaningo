using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;

var builder = WebApplication.CreateBuilder(args);

// Configure Firebase first
ConfigureFirebase(builder.Configuration);

// Configure Kestrel
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(7016, listenOptions =>
    {
        listenOptions.UseHttps();
    });
});

// Configure Services
ConfigureServices(builder.Services, builder.Configuration);

var app = builder.Build();

// Configure Middleware
ConfigureMiddleware(app);

Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("🚀 Server successfully started at https://localhost:7016");
Console.ResetColor();

await app.RunAsync();

// Firebase Configuration
void ConfigureFirebase(IConfiguration configuration)
{
    var firestoreSettings = configuration.GetSection("FirestoreSettings").Get<FirestoreSettings>();
    var credentialsPath = Path.Combine(Directory.GetCurrentDirectory(), 
        firestoreSettings?.CredentialsPath ?? "credentials/firebase/serviceAccountKey.json");
    
    Console.WriteLine($"Loading Firebase credentials from: {credentialsPath}");
    
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
    services.AddControllers();
    services.AddEndpointsApiExplorer();
    services.AddSwaggerGen();
    
    services.Configure<FirestoreSettings>(configuration.GetSection("FirestoreSettings"));
    
    var firestoreSettings = configuration.GetSection("FirestoreSettings").Get<FirestoreSettings>();
    services.AddSingleton(FirestoreDb.Create(firestoreSettings?.ProjectId));
    
    // Register Services
    services.AddScoped<WordService>();
    services.AddScoped<UserService>();
    services.AddScoped<StatsService>();
    services.AddScoped<QuizService>();
    
    // Configure CORS
    var allowedOrigins = configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();
    services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins(allowedOrigins ?? Array.Empty<string>())
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });
}

// Middleware Configuration
void ConfigureMiddleware(WebApplication app)
{
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseCors("AllowFrontend");
    app.UseAuthorization();
    app.MapControllers();
}