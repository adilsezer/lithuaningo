# Lithuaningo - AI-Powered Language Learning

A comprehensive Lithuanian language learning mobile application featuring AI-generated content, interactive challenges, flashcards, and real-time chat assistance.

## Features

### Core Learning Tools

- **AI-Generated Flashcards** - Lithuanian vocabulary with translations, example sentences, images, and audio
- **Interactive Challenges** - Multiple choice, true/false, fill-in-the-blank, and sentence rearrangement exercises
- **AI Chat Assistant** - Real-time conversational practice and grammar explanations
- **Progress Tracking** - Detailed statistics and streak tracking
- **Global Leaderboard** - Weekly rankings and competitive learning

### User Management

- **Multi-Provider Authentication** - Email, Google, and Apple Sign-In via Supabase
- **Premium Subscriptions** - RevenueCat integration with monthly/annual plans
- **User Profiles** - Customizable profiles with learning statistics
- **Admin Panel** - Content review and management tools

### Premium Features

- Unlimited AI interactions and flashcard generation
- Advanced learning statistics and progress analytics
- Priority support and early access to new features

## Tech Stack

### Frontend (React Native + Expo)

- **Framework**: React Native with Expo SDK
- **Language**: TypeScript
- **UI**: React Native Paper
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Authentication**: Supabase Auth with social providers
- **Subscriptions**: RevenueCat
- **Storage**: AsyncStorage for local data

### Backend (.NET 8 Web API)

- **Framework**: ASP.NET Core 8
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI GPT-4 for content generation and chat
- **File Storage**: Cloudflare R2 for images and audio
- **Authentication**: Supabase JWT validation
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
lithuaningo/
├── frontend/                 # React Native mobile app
│   ├── src/
│   │   ├── app/             # Expo Router screens
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API clients and external services
│   │   ├── stores/          # Zustand state management
│   │   └── types/           # TypeScript type definitions
│   └── assets/              # Images, fonts, and static files
├── backend/                 # .NET Web API
│   └── Lithuaningo.API/
│       ├── Controllers/     # API endpoints
│       ├── Services/        # Business logic and external integrations
│       ├── Models/          # Database models
│       ├── DTOs/            # Data transfer objects
│       └── Middleware/      # Custom middleware
└── docs/                    # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- .NET 8 SDK
- Expo CLI
- Supabase account
- OpenAI API key
- RevenueCat account

### Frontend Setup

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables in `.env`:

   ```
   EXPO_PUBLIC_API_URL=your-api-url
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id
   ```

3. Start development server:
   ```bash
   npx expo start
   ```

### Backend Setup

1. Navigate to the API project:

   ```bash
   cd backend/Lithuaningo.API
   ```

2. Configure `appsettings.Development.json`:

   ```json
   {
     "OpenAI": {
       "ApiKey": "your-openai-api-key"
     },
     "Supabase": {
       "Url": "your-supabase-url",
       "ServiceKey": "your-supabase-service-key"
     },
     "RevenueCat": {
       "WebhookSecret": "your-webhook-secret"
     }
   }
   ```

3. Run the API:
   ```bash
   dotnet run
   ```

## API Documentation

The API includes comprehensive Swagger documentation available at `/swagger` when running in development mode.

### Key Endpoints

- `/api/auth/*` - Authentication and user management
- `/api/flashcards` - Flashcard generation and retrieval
- `/api/challenges` - Challenge questions and submissions
- `/api/ai/chat` - AI chat assistant
- `/api/leaderboard` - Weekly rankings
- `/api/admin/*` - Administrative functions

## Deployment

### Mobile App

Deploy using Expo Application Services (EAS):

```bash
eas build --platform all
eas submit --platform all
```

### Backend API

Deploy to Azure App Service or similar cloud provider:

```bash
dotnet publish -c Release -o ./publish
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with appropriate tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, contact: lithuaningo@gmail.com
