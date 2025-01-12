# Lithuaningo

A mobile application for learning the Lithuanian language through interactive exercises and daily practice.

---

## Tech Stack

### Frontend

- React Native (0.76.5) with Expo (v52)
- TypeScript
- Redux Toolkit & Redux Persist for state management
- Firebase Authentication & Crashlytics
- Expo Router for navigation
- React Hook Form for form management
- React Native IAP for in-app purchases
- Expo Notifications for push notifications
- Expo modules:
  - Image Picker
  - Linear Gradient
  - Apple Authentication
  - Audio/Video
  - Device
  - Font
  - Constants
  - System UI
  - Splash Screen

### Backend

- .NET 8.0 Web API
- Firebase Admin SDK (v3.1.0)
- Google Cloud Firestore (v3.9.0)
- gRPC.Net.Client (v2.67.0)
- Swagger/OpenAPI documentation
- Custom middleware for:
  - CORS management
  - Authentication
  - Error handling
  - Request logging

### Services

#### Backend Services

- User Management
- Sentence Management
- Word Management
- Announcements
- App Information
- Deck Management
- Flashcard System
- Practice Sessions
- Quiz System with:
  - Question Generation Factory
  - Random Generation
  - Multiple Quiz Types

#### Frontend Services

- Authentication Service
- API Integration Services
- Local Storage Service
- Push Notification Service
- In-App Purchase Service
- Analytics Service

---

## Features

- **User Authentication**

  - Email/Password login
  - Google Sign-In
  - Apple Sign-In
  - Secure token management

- **Learning System**

  - Multiple-choice questions
  - Fill-in-the-blank exercises
  - True/false questions
  - Flashcard system
  - Spaced repetition
  - Progress tracking

- **Content Management**

  - Custom deck creation
  - Flashcard management
  - Word categories
  - Sentence examples
  - Audio pronunciations
  - Image attachments

- **Practice & Assessment**

  - Daily quizzes
  - Practice sessions
  - Performance analytics
  - Learning statistics
  - Achievement system

- **User Experience**

  - Offline support
  - Cross-platform compatibility
  - Cloud synchronization
  - Push notifications
  - Dark/Light theme
  - Customizable UI
  - Accessibility features

- **Premium Features**
  - Advanced statistics
  - Additional content
  - Priority support
  - Ad-free experience
  - Custom practice sessions

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
