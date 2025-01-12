# Lithuaningo

A mobile application for learning the Lithuanian language through interactive exercises and daily practice.

---

## Tech Stack

### Frontend

- React Native with Expo (v52)
- TypeScript
- Redux Toolkit for state management
- Firebase Authentication
- Firebase Crashlytics
- Expo Router for navigation

### Backend

- .NET 8.0 Web API
- Firebase Admin SDK
- Google Cloud Firestore
- Swagger/OpenAPI documentation

---

## Features

- **User Authentication**: Secure login via Email, Google Sign-In, and Apple Sign-In
- **Interactive Learning Modules**: Multiple-choice, fill-in-the-blank, and true/false exercises
- **Progress Tracking**: Detailed statistics and learning analytics
- **User Profile Management**: Customizable profiles with learning preferences
- **Leaderboard System**: Competitive learning with weekly rankings
- **Daily Sentence Learning**: Context-based sentence learning
- **Word Teaching**: Systematic vocabulary building
- **Quiz System**: Adaptive daily quizzes
- **Offline Support**: Learn without an internet connection
- **Cross-Platform**: Available for iOS and Android
- **Cloud Sync**: Seamless data synchronization across devices
- **Performance Analytics**: Crash reporting and usage analytics

---

## Installation

### Prerequisites

- Node.js (LTS version)
- .NET 8.0 SDK
- Firebase project setup
- Google Cloud project access

### Frontend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/lithuaningo.git
   cd lithuaningo/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
   EXPO_PUBLIC_EAS_PROJECT_ID=your-eas-project-id
   ANDROID_GOOGLE_SERVICES_BASE64=your-base64-encoded-google-services
   IOS_GOOGLE_SERVICES_BASE64=your-base64-encoded-google-services
   EXPO_PUBLIC_API_URL=your-api-url
   ```

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd ../backend
   ```

2. Restore packages:

   ```bash
   dotnet restore
   ```

3. Configure Firebase Admin SDK:
   - Add your Firebase Admin SDK credentials file.
   - Update configuration in `appsettings.json`.

---

## Development

### Frontend

- Start development server:

  ```bash
  npm start
  ```

- Run on Android:

  ```bash
  npm run android
  ```

- Run on iOS:

  ```bash
  npm run ios
  ```

- Run type checking:
  ```bash
  npm run ts:check
  ```

### Backend

- Run API locally:

  ```bash
  dotnet run --project Lithuaningo.API
  ```

- Build solution:

  ```bash
  dotnet build
  ```

- Run tests:
  ```bash
  dotnet test
  ```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For inquiries, please contact us at [lithuaningo@gmail.com](mailto:lithuaningo@gmail.com).
