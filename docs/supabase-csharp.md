# Supabase C# Client Library Documentation

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Initialization](#initialization)
- [Database Operations](#database-operations)
  - [Fetch Data](#fetch-data)
  - [Insert Data](#insert-data)
  - [Update Data](#update-data)
  - [Upsert Data](#upsert-data)
  - [Delete Data](#delete-data)
  - [Call Postgres Functions](#call-postgres-functions)
- [Filtering](#filtering)
  - [Basic Filters](#basic-filters)
  - [Advanced Filters](#advanced-filters)
  - [Pattern Matching](#pattern-matching)
  - [Array Operations](#array-operations)
- [Modifiers](#modifiers)
- [Authentication](#authentication)
- [Realtime](#realtime)
- [Storage](#storage)
- [Edge Functions](#edge-functions)

## Overview

The Supabase C# client library provides a powerful interface to interact with your Supabase backend. It supports:

- Database operations
- Real-time subscriptions
- Authentication
- Storage management
- Edge Functions
- Type-safe operations with model classes

## Installation

Install via NuGet Package Manager:

```bash
dotnet add package supabase
```

## Initialization

```csharp
var url = Environment.GetEnvironmentVariable("SUPABASE_URL");
var key = Environment.GetEnvironmentVariable("SUPABASE_KEY");

var options = new Supabase.SupabaseOptions
{
    AutoConnectRealtime = true
};

var supabase = new Supabase.Client(url, key, options);
await supabase.InitializeAsync();
```

## Database Operations

### Model Definition

Models must derive from `BaseModel` and use appropriate attributes:

```csharp
[Table("cities")]
class City : BaseModel
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("country_id")]
    public int CountryId { get; set; }
}
```

### Fetch Data

```csharp
// Basic fetch
var result = await supabase.From<City>().Get();
var cities = result.Models;

// With selection
var result = await supabase.From<City>()
    .Select(x => new object[] { x.Name, x.CountryId })
    .Get();
```

### Insert Data

```csharp
var city = new City
{
    Name = "The Shire",
    CountryId = 554
};

await supabase.From<City>().Insert(city);
```

### Update Data

```csharp
await supabase
    .From<City>()
    .Where(x => x.Name == "Auckland")
    .Set(x => x.Name, "Middle Earth")
    .Update();
```

### Upsert Data

```csharp
var city = new City
{
    Id = 554,
    Name = "Middle Earth"
};

await supabase.From<City>().Upsert(city);
```

### Delete Data

```csharp
await supabase
    .From<City>()
    .Where(x => x.Id == 342)
    .Delete();
```

## Filtering

### Basic Filters

```csharp
// Equality
var result = await supabase.From<City>()
    .Where(x => x.Name == "Bali")
    .Get();

// Inequality
var result = await supabase.From<City>()
    .Where(x => x.Name != "Bali")
    .Get();

// Greater than
var result = await supabase.From<City>()
    .Where(x => x.CountryId > 250)
    .Get();

// Less than or equal
var result = await supabase.From<City>()
    .Where(x => x.CountryId <= 250)
    .Get();
```

### Pattern Matching

```csharp
// Case sensitive LIKE
var result = await supabase.From<City>()
    .Filter(x => x.Name, Operator.Like, "%la%")
    .Get();

// Case insensitive ILIKE
await supabase.From<City>()
    .Filter(x => x.Name, Operator.ILike, "%la%")
    .Get();
```

### Array Operations

```csharp
// IN operator
var result = await supabase.From<City>()
    .Filter(x => x.Name, Operator.In, new List<object> { "Rio de Janeiro", "San Francisco" })
    .Get();

// Contains
var result = await supabase.From<City>()
    .Filter(x => x.MainExports, Operator.Contains, new List<object> { "oil", "fish" })
    .Get();
```

## Modifiers

### Ordering

```csharp
var result = await supabase.From<City>()
    .Select(x => new object[] { x.Name, x.CountryId })
    .Order(x => x.Id, Ordering.Descending)
    .Get();
```

### Pagination

```csharp
// Limit
var result = await supabase.From<City>()
    .Select(x => new object[] { x.Name, x.CountryId })
    .Limit(10)
    .Get();

// Range
var result = await supabase.From<City>()
    .Select("name, country_id")
    .Range(0, 3)
    .Get();
```

## Authentication

### Sign Up

```csharp
var session = await supabase.Auth.SignUp(email, password);
```

### Sign In

```csharp
// Email/Password
var session = await supabase.Auth.SignIn(email, password);

// Magic Link
var options = new SignInOptions { RedirectTo = "http://myredirect.example" };
var didSendMagicLink = await supabase.Auth.SendMagicLink("user@example.com", options);

// OAuth
var signInUrl = supabase.Auth.SignIn(Provider.Github);
```

### Session Management

```csharp
// Get current session
var session = supabase.Auth.CurrentSession;

// Get current user
var user = supabase.Auth.CurrentUser;

// Sign out
await supabase.Auth.SignOut();
```

### Auth State Changes

```csharp
supabase.Auth.AddStateChangedListener((sender, changed) =>
{
    switch (changed)
    {
        case AuthState.SignedIn:
            // Handle sign in
            break;
        case AuthState.SignedOut:
            // Handle sign out
            break;
        // ... other states
    }
});
```

## Realtime

### Subscribe to Changes

```csharp
class CursorBroadcast : BaseBroadcast
{
    [JsonProperty("cursorX")]
    public int CursorX { get; set; }

    [JsonProperty("cursorY")]
    public int CursorY { get; set; }
}

var channel = supabase.Realtime.Channel("any");
var broadcast = channel.Register<CursorBroadcast>();
broadcast.AddBroadcastEventHandler((sender, baseBroadcast) =>
{
    var response = broadcast.Current();
});

await channel.Subscribe();
```

### Send Broadcast

```csharp
await broadcast.Send("cursor", new CursorBroadcast
{
    CursorX = 123,
    CursorY = 456
});
```

## Storage

### Bucket Operations

```csharp
// Create bucket
var bucket = await supabase.Storage.CreateBucket("avatars");

// List buckets
var buckets = await supabase.Storage.ListBuckets();

// Delete bucket
var result = await supabase.Storage.DeleteBucket("avatars");
```

### File Operations

```csharp
// Upload
await supabase.Storage
    .From("avatars")
    .Upload(
        imagePath,
        "fancy-avatar.png",
        new FileOptions { CacheControl = "3600", Upsert = false }
    );

// Download
var bytes = await supabase.Storage
    .From("avatars")
    .Download("public/fancy-avatar.png");

// List files
var objects = await supabase.Storage
    .From("avatars")
    .List();

// Delete files
await supabase.Storage
    .From("avatars")
    .Remove(new List<string> { "public/fancy-avatar.png" });
```

### URLs

```csharp
// Signed URL
var url = await supabase.Storage
    .From("avatars")
    .CreateSignedUrl("public/fancy-avatar.png", 60);

// Public URL
var publicUrl = supabase.Storage
    .From("avatars")
    .GetPublicUrl("public/fancy-avatar.png");
```

## Edge Functions

```csharp
var options = new InvokeFunctionOptions
{
    Headers = new Dictionary<string, string>
    {
        { "Authorization", "Bearer 1234" }
    },
    Body = new Dictionary<string, object>
    {
        { "foo", "bar" }
    }
};

await supabase.Functions.Invoke("hello", options: options);
```

## Best Practices

1. **Model Definition**

   - Always use appropriate attributes (`[Table]`, `[Column]`, `[PrimaryKey]`)
   - Follow C# naming conventions for properties
   - Use meaningful names that reflect database structure

2. **Error Handling**

   - Implement proper try-catch blocks
   - Handle authentication errors appropriately
   - Validate data before sending to the database

3. **Performance**

   - Use appropriate filters to minimize data transfer
   - Implement pagination for large datasets
   - Clean up realtime subscriptions when not needed

4. **Security**
   - Never expose API keys in client-side code
   - Implement proper role-based access control
   - Use environment variables for sensitive data

## Common Issues and Solutions

1. **Authentication Issues**

   - Ensure proper initialization of Supabase client
   - Check if tokens are properly stored and refreshed
   - Verify email confirmation settings

2. **Database Operations**

   - Verify table and column names match exactly
   - Check if proper permissions are set in Supabase
   - Ensure proper model definitions

3. **Realtime**
   - Verify realtime is enabled for the table
   - Check channel subscription status
   - Implement proper error handling for disconnections

## Additional Resources

- [Official Supabase Documentation](https://supabase.com/docs)
- [Supabase GitHub Repository](https://github.com/supabase/supabase)
- [C# Client Library Source](https://github.com/supabase-community/supabase-csharp)
