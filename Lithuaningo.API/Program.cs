using Google.Cloud.Firestore;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add configuration
builder.Services.Configure<FirestoreSettings>(
    builder.Configuration.GetSection("FirestoreSettings"));

// Get settings
var firestoreSettings = builder.Configuration
    .GetSection("FirestoreSettings")
    .Get<FirestoreSettings>();

// Create full path
var credentialsPath = Path.Combine(
    Directory.GetCurrentDirectory(), 
    firestoreSettings?.CredentialsPath ?? "credentials/credentials.json"
);

// Add Firestore
builder.Services.AddSingleton(FirestoreDb.Create(firestoreSettings?.ProjectId));

// Register services
builder.Services.AddScoped<WordService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<StatsService>();
builder.Services.AddScoped<QuizService>();

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();