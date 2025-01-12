# Release Instructions

This document provides step-by-step instructions for building and deploying the Lithuaningo application.

## Prerequisites

### Frontend Requirements

- Node.js (LTS version)
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Xcode 15+ (for iOS builds)
- Android Studio (for Android builds)
- JDK 17+
- Firebase project access
- Apple Developer account (for iOS)
- Google Play Console access (for Android)

### Backend Requirements

- .NET 8.0 SDK
- Firebase Admin SDK credentials
- Google Cloud project access
- SSL certificate (for production)

## Frontend Build Process

### 1. Environment Setup

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables in `.env`:

   ```bash
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
   EXPO_PUBLIC_EAS_PROJECT_ID=your-eas-project-id
   ANDROID_GOOGLE_SERVICES_BASE64=your-base64-encoded-google-services
   IOS_GOOGLE_SERVICES_BASE64=your-base64-encoded-google-services
   EXPO_PUBLIC_API_URL=your-api-url
   ```

3. Configure Firebase:
   - Add `google-services.json` for Android
   - Add `GoogleService-Info.plist` for iOS

### 2. Development Build

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### 3. Production Build

Using EAS Build (Recommended):

```bash
# Configure EAS
eas configure

# Build for both platforms
eas build --platform all

# Build for specific platform
eas build --platform ios
eas build --platform android
```

### 4. Submit to Stores

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

## Backend Deployment

### 1. Configuration Setup

1. Configure Firebase Admin SDK:

   - Place `serviceAccountKey.json` in `backend/Lithuaningo.API/credentials/firebase/`
   - Update `appsettings.json` with correct Firebase project ID

2. Configure CORS settings in `appsettings.json`:
   ```json
   {
     "CorsSettings": {
       "AllowedOrigins": ["your-frontend-url"]
     }
   }
   ```

### 2. Build and Deploy

1. Build the API:

   ```bash
   cd backend
   dotnet restore
   dotnet build
   ```

2. Publish for deployment:

   ```bash
   dotnet publish -c Release
   ```

3. Deploy to hosting environment:
   - Configure SSL certificate
   - Set up reverse proxy (if needed)
   - Configure environment variables

## Post-Deployment Checklist

### Frontend

- [ ] Verify Firebase services (Auth, Crashlytics)
- [ ] Test push notifications
- [ ] Validate in-app purchases
- [ ] Check offline functionality
- [ ] Test deep linking

### Backend

- [ ] Verify Firebase Admin SDK connection
- [ ] Test Firestore operations
- [ ] Validate API endpoints
- [ ] Check CORS configuration
- [ ] Monitor error logging

## Troubleshooting

### Common Frontend Issues

1. Build Failures

   - Clear Expo cache: `expo clean`
   - Reset node_modules: `rm -rf node_modules && npm install`
   - Update EAS CLI: `npm install -g eas-cli`

2. Firebase Integration

   - Verify google-services.json and GoogleService-Info.plist
   - Check Firebase configuration in app
   - Validate OAuth credentials

3. Store Submission
   - Verify app signing
   - Check app metadata
   - Validate in-app purchases

### Common Backend Issues

1. Firebase Admin SDK

   - Check credentials file path
   - Verify project ID
   - Test Firebase connection

2. API Issues
   - Validate CORS settings
   - Check SSL configuration
   - Test endpoint authorization

## References

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [.NET Deployment Guide](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
