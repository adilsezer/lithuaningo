LITHUANINGO FRONTEND DOCUMENTATION

OVERVIEW
Lithuaningo is a mobile application for learning the Lithuanian language through interactive exercises and daily practice. Built with React Native and Expo, the app provides a comprehensive learning experience with features like flashcards, quizzes, and progress tracking.

TECH STACK

- React Native (Expo SDK 52)
- TypeScript
- Redux Toolkit & Redux Persist
- Firebase (Authentication, Crashlytics)
- Expo Router for navigation
- React Hook Form
- Axios for API calls

PROJECT STRUCTURE
/src
/app - Expo Router screens and navigation
/components - Reusable UI components
/hooks - Custom React hooks
/services - API and business logic
/types - TypeScript interfaces and types
/redux - Store configuration and slices
/utils - Utility functions
/styles - Theme and shared styles
/context - React Context providers
/providers - Service providers and HOCs

CORE FEATURES

1. Authentication System

- Email/Password authentication
- Google Sign-In integration
- Apple Sign-In integration
- User profile management

2. Learning System

- Daily sentences with translations
- Multiple choice questions
- Fill-in-the-blank exercises
- Word pronunciation with audio
- Progress tracking and statistics
- Spaced repetition algorithm

3. Flashcard System

- Custom deck creation
- Public/private deck management
- Image and audio attachments
- Practice mode with spaced repetition
- Progress tracking per deck
- Community sharing features

4. User Interface

- Dark/Light theme support
- Responsive design
- Custom typography components
- Loading states and error boundaries
- Platform-specific adaptations

5. File Management

- Image and audio file upload support
- File type validation
- Multipart form data handling
- Cloud storage integration
- File size limitations

6. Form Management

- Dynamic form field generation
- Field validation
- Custom input components
- File upload integration
- Error handling

7. Error Handling & Monitoring

- Firebase Crashlytics integration
- Structured error logging
- Global error boundaries
- Network error handling
- Form validation errors

KEY DATA TYPES

UserProfile {
id: string
name: string
email: string
learnedSentences: string[]
todayAnsweredQuestions: number
todayCorrectAnsweredQuestions: number
lastCompleted: Date
isAdmin: boolean
hasPurchasedExtraContent: boolean
}

Flashcard {
id: string
deckId: string
front: string
back: string
audioUrl?: string
imageUrl?: string
exampleSentence?: string
createdBy: string
createdAt: string
}

PracticeStats {
Id: string
UserId: string
DeckId: string
TotalCards: int
MasteredCards: int
NeedsPractice: int
LastPracticed: DateTime
CardProgress: Dictionary<string, CardProgress>
}

CardProgress {
CorrectAttempts: int
TotalAttempts: int
LastPracticed: DateTime
Mastered: bool
}

AppInfo {
Id: string
LatestVersion: string
MandatoryUpdate: bool
UpdateUrl: string
IsUnderMaintenance: bool
}

STATE MANAGEMENT

- Redux Toolkit for global state
- Redux Persist for data persistence
- Local useState for component state
- Custom hooks for complex state logic

ENVIRONMENT VARIABLES
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
EXPO_PUBLIC_EAS_PROJECT_ID
ANDROID_GOOGLE_SERVICES_BASE64
IOS_GOOGLE_SERVICES_BASE64
EXPO_PUBLIC_API_URL

BUILD AND DEPLOYMENT

- Development builds via 'expo start'
- Production builds via EAS Build
- Platform-specific configurations
- Automated CI/CD pipeline

DEVELOPMENT GUIDELINES

1. Code Style

- Use functional components
- Implement proper TypeScript types
- Follow React Native best practices
- Use proper error handling
- Implement proper cleanup in useEffect

2. Performance

- Use proper memoization
- Optimize image loading
- Implement proper caching
- Use FlashList for long lists
- Optimize bundle size

3. Testing

- TypeScript type checking
- Component testing
- Integration testing
- Performance monitoring

ADDITIONAL RESOURCES

- README.md for setup instructions
- Privacy Policy documentation
- Terms of Service documentation
- License information

LITHUANINGO BACKEND DOCUMENTATION

OVERVIEW
.NET 8.0 Web API backend service for the Lithuaningo language learning application. Provides RESTful endpoints for user management, content delivery, and learning progress tracking.

TECH STACK

- .NET 8.0 Web API
- Firebase Admin SDK (v3.1.0)
- Google Cloud Firestore
- Google Cloud Storage
- gRPC.Net.Client
- Swagger/OpenAPI

PROJECT STRUCTURE
/Lithuaningo.API
/Controllers - API endpoints
/Models - Domain models and DTOs
/Services - Business logic implementation
/Settings - Configuration classes
/Middleware - Custom middleware
/Extensions - Extension methods
/Interfaces - Service contracts

CORE FEATURES

1. User Management

- Firebase authentication integration
- User profile management
- Progress tracking
- Authorization middleware
- Role-based access control

2. Content Management

- Flashcard CRUD operations
- Deck management system
- Word and sentence database
- Audio and image storage
- Content moderation system

3. Learning System

- Quiz generation
- Progress tracking
- Spaced repetition algorithm
- Performance analytics
- Achievement system

4. File Management

- Cloud Storage integration
- File upload handling
- Content type validation
- Size limit enforcement (10MB)
- Secure URL generation

5. API Security

- HTTPS enforcement in production
- File size restrictions
- Content type validation
- Request rate limiting
- Input sanitization

6. Development Configuration

- Development mode on port 7016
- HTTPS in production
- Swagger/OpenAPI integration
- File upload documentation
- Custom middleware configuration

KEY DATA MODELS

UserProfile {
Id: string
Name: string
Email: string
LearnedSentences: List<string>
TodayAnsweredQuestions: int
TodayCorrectAnsweredQuestions: int
LastCompleted: DateTime
IsAdmin: bool
HasPurchasedExtraContent: bool
}

Flashcard {
Id: string
DeckId: string
Front: string
Back: string
AudioUrl: string
ImageUrl: string
ExampleSentence: string
CreatedBy: string
CreatedAt: DateTime
}

Report {
Id: string
ContentType: string
ContentId: string
Reason: string
Details: string
ReportedBy: string
CreatedAt: DateTime
Status: string
ReviewedBy: string
ReviewedAt: DateTime
}

PracticeStats {
Id: string
UserId: string
DeckId: string
TotalCards: int
MasteredCards: int
NeedsPractice: int
LastPracticed: DateTime
CardProgress: Dictionary<string, CardProgress>
}

CardProgress {
CorrectAttempts: int
TotalAttempts: int
LastPracticed: DateTime
Mastered: bool
}

AppInfo {
Id: string
LatestVersion: string
MandatoryUpdate: bool
UpdateUrl: string
IsUnderMaintenance: bool
}

API ENDPOINTS

1. Authentication

- Authentication is handled through firebase in frontend

2. Flashcards

- GET /api/flashcards
- POST /api/flashcards
- PUT /api/flashcards/{id}
- DELETE /api/flashcards/{id}

3. Practice

- GET /api/practice/stats
- POST /api/practice/progress
- GET /api/practice/history

4. Files

- POST /api/flashcard/upload
- Content-Type: multipart/form-data
- File size limit: 10MB
- Supports: images, audio files

5. App Info

- GET /api/app/info
- GET /api/app/version
- GET /api/app/maintenance

SECURITY FEATURES

- Role-based authorization
- CORS policy configuration
- Input validation
- Rate limiting
- Secure headers
- Error handling middleware

DATABASE

- Firestore storage for image and audio files
- Proper indexing
- Query optimization

ERROR HANDLING

- Global exception middleware
- Structured logging
- Consistent error responses
- Validation error handling
- Custom exception types

DEPLOYMENT

- Azure App Service
- CI/CD pipeline
- Environment configurations
- Monitoring and logging
- Backup procedures

DEVELOPMENT GUIDELINES

1. Code Style

- Follow C# conventions
- Use async/await
- Implement SOLID principles
- Use dependency injection
- Proper error handling

2. Performance

- Efficient LINQ queries
- Proper caching
- Prevent N+1 queries
- Response compression
- Async operations

3. Testing

- Unit testing
- Integration testing
- Performance testing
- Security testing

ADDITIONAL RESOURCES

- API Documentation (Swagger)
- Setup Instructions
- Deployment Guide
- Security Guidelines
