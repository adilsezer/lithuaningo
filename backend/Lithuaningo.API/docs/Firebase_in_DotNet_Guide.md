## Introduction to Firebase in .NET

## Firebase Overview

When designing and building applications, often we find ourselves needing third-party services such as databases, push notifications, hosting, and authentication. Firebase, built by Google, provides an all-in-one platform for developing and scaling applications.

### What is Firebase?

Firebase is a service offered by Google for developing and scaling mobile, web, and desktop applications. It originally launched in 2011 with the Realtime Database, a NoSQL database that synchronizes data between users in real time.

Firebase now offers:

- **Authentication**: End-to-end user authentication system with options for email/password or social logins (Google, Facebook, GitHub, etc.).
- **Cloud Messaging**: Send notifications to Android and iOS devices.
- **Hosting**: Simple deployment and rollback for applications.
- **Cloud Storage**: Reliable storage for files like photos and videos.

---

## Create a Firebase Project

### Step 1: Set Up Your Firebase Project

- Navigate to the [Firebase Console](https://console.firebase.google.com).
- Create a new Firebase project.
- Retrieve your **Project ID** from the Project Settings.

### Step 2: Configure Authentication

Firebase handles authentication with service accounts. To set up:

1. Go to **Project Settings** -> **Service Accounts**.
2. Generate a new private key.
3. Save the downloaded JSON file.

Use the following code to authenticate:

```csharp
var builder = WebApplication.CreateBuilder(args);
Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", @"<PATH_TO_CREDENTIALS_FILE>");
var app = builder.Build();
```

---

## Firestore in .NET

Firestore is a real-time, NoSQL database for storing JSON documents.

### Step 1: Install the Firestore NuGet Package

```bash
Install-Package Google.Cloud.Firestore
```

### Step 2: Define Models

```csharp
[FirestoreData]
public class ShoeDocument
{
    [FirestoreDocumentId]
    public string Id { get; set; }
    [FirestoreProperty]
    public required string Name { get; set; }
    [FirestoreProperty]
    public required string Brand { get; set; }
    [FirestoreProperty]
    public required string Price { get; set; }
}
```

### Step 3: Implement Firestore Service

Create a service to interact with Firestore:

```csharp
public class FirestoreService : IFirestoreService
{
    private readonly FirestoreDb _firestoreDb;
    private const string _collectionName = "Shoes";

    public FirestoreService(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<List<Shoe>> GetAll()
    {
        var collection = _firestoreDb.Collection(_collectionName);
        var snapshot = await collection.GetSnapshotAsync();

        return snapshot.Documents.Select(doc => doc.ConvertTo<Shoe>()).ToList();
    }

    public async Task AddAsync(Shoe shoe)
    {
        var collection = _firestoreDb.Collection(_collectionName);
        await collection.AddAsync(shoe);
    }
}
```

### Step 4: Add Razor Pages for Interaction

#### Display Shoes:

```html
@page @model Firebase.Pages.Firestore.IndexModel

<h2>Shoes</h2>
<table>
  <tr>
    <th>Name</th>
    <th>Brand</th>
    <th>Price</th>
  </tr>
  @foreach (var shoe in Model.Shoes) {
  <tr>
    <td>@shoe.Name</td>
    <td>@shoe.Brand</td>
    <td>@shoe.Price</td>
  </tr>
  }
</table>
```

---

## Firebase Cloud Storage

### Step 1: Install NuGet Package

```bash
Install-Package Google.Cloud.Storage.V1
```

### Step 2: Configure Cloud Storage

- Go to the Firebase Console -> **Storage**.
- Create a new bucket.
- Allow public access for image rendering.

### Step 3: Create a Storage Service

```csharp
public class FirebaseStorageService : IFirebaseStorageService
{
    private readonly StorageClient _storageClient;
    private const string BucketName = "<BUCKET_NAME>";

    public FirebaseStorageService(StorageClient storageClient)
    {
        _storageClient = storageClient;
    }

    public async Task<Uri> UploadFile(string name, IFormFile file)
    {
        using var stream = new MemoryStream();
        await file.CopyToAsync(stream);
        var obj = await _storageClient.UploadObjectAsync(BucketName, name, null, stream);
        return new Uri(obj.MediaLink);
    }
}
```

### Step 4: Update Razor Pages to Support Image Uploads

#### Update Model:

```csharp
public class Shoe
{
    public string Name { get; set; }
    public string Brand { get; set; }
    public string Price { get; set; }
    public string ImageUri { get; set; }
}
```

#### Display Images:

```html
<img src="@shoe.ImageUri" alt="Shoe Image" />
```

---

## Conclusion

This guide explored Firebase's Firestore and Cloud Storage features. These tools are ideal for developing scalable .NET applications. Dive deeper into Firebase to unlock its full potential!

---
