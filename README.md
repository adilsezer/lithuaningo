# Lithuaningo - AI-Powered Language Learning

A streamlined Lithuanian language learning application with AI-generated content focused on three core features: Flashcards, Challenges, and Leaderboards.

## Project Overview

Lithuaningo is a simplified version of the full Lithuaningo language learning platform, focusing on delivering an efficient learning experience through AI-generated content. The application eliminates authentication requirements and complex user management in favor of a streamlined, focused learning approach.

### Core Features

1. **AI-Generated Flashcards** - Lithuanian vocabulary with translations and example sentences
2. **AI-Generated Challenges** - Multiple choice, true/false, and fill-in-the-blank exercises
3. **Global Leaderboard** - Anonymous score tracking using device IDs
4. **Premium Subscription** - Limited free access with premium features via monthly/annual subscription

### Technical Stack

#### Frontend

- React Native (latest version)
- Expo SDK (latest version)
- TypeScript
- React Native Paper for UI components
- Zustand for state management
- AsyncStorage for local data persistence
- Expo Router for navigation
- RevenueCat for in-app subscription management

#### Backend

- .NET 8 Web API
- OpenAI integration for content generation
- Supabase for authentication and database
- Supabase Storage for assets
- Azure App Service hosting

## Project Structure

### Frontend Structure

```
lithuaningo/
├── assets/                  # Images, fonts, and static assets
├── src/
│   ├── app/                 # Expo Router screens and navigation
│   │   ├── _layout.tsx      # Root layout with navigation configuration
│   │   ├── index.tsx        # Home screen (Flashcards)
│   │   ├── challenges.tsx   # Challenges screen
│   │   ├── leaderboard.tsx  # Leaderboard screen
│   │   └── premium.tsx      # Premium subscription screen
│   ├── components/
│   │   ├── ui/              # Basic UI components
│   │   │   ├── Card.tsx     # Flashcard component
│   │   │   ├── Challenge.tsx# Challenge component
│   │   │   ├── Button.tsx   # Custom button component
│   │   │   └── ...
│   │   └── layout/          # Layout components
│   │       ├── Screen.tsx   # Screen wrapper component
│   │       └── ...
│   ├── hooks/
│   │   ├── useFlashcards.ts # Flashcard data fetching and management
│   │   ├── useChallenges.ts # Challenge data fetching and management
│   │   ├── useLeaderboard.ts# Leaderboard data fetching
│   │   ├── useDeviceId.ts   # Device ID generation and persistence
│   │   └── useSubscription.ts # RevenueCat subscription management
│   ├── services/
│   │   ├── api.ts           # API client and request handlers
│   │   ├── storage.ts       # Local storage utilities
│   │   └── supabase.ts      # Supabase client configuration
│   ├── stores/
│   │   ├── flashcardStore.ts# Flashcard state management
│   │   ├── challengeStore.ts# Challenge state management
│   │   ├── subscriptionStore.ts # Subscription state management
│   │   └── appStore.ts      # App-wide state management
│   ├── styles/
│   │   ├── theme.ts         # Application theme configuration
│   │   └── typography.ts    # Typography styles
│   └── utils/
│       ├── scoring.ts       # Score calculation utilities
│       └── deviceId.ts      # Device ID utilities
├── App.tsx                  # Application entry point
├── app.json                 # Expo configuration
├── babel.config.js          # Babel configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

### Backend Structure

```
Lithuaningo.API/
├── Controllers/             # API endpoints
│   ├── FlashcardController.cs  # Flashcard endpoints
│   ├── ChallengeController.cs  # Challenge endpoints
│   └── LeaderboardController.cs# Leaderboard endpoints
├── Models/                  # Domain models
│   ├── Flashcard.cs         # Flashcard model
│   ├── Challenge.cs         # Challenge model
│   ├── LeaderboardEntry.cs  # Leaderboard entry model
│   └── ...
├── DTOs/                    # Data transfer objects
│   ├── FlashcardDto.cs      # Flashcard DTOs
│   ├── ChallengeDto.cs      # Challenge DTOs
│   ├── LeaderboardDto.cs    # Leaderboard DTOs
│   └── ...
├── Services/                # Service implementations
│   ├── AI/
│   │   ├── AIService.cs     # OpenAI integration service
│   │   └── ...
│   ├── Data/
│   │   ├── FlashcardService.cs  # Flashcard data service
│   │   ├── ChallengeService.cs  # Challenge data service
│   │   ├── LeaderboardService.cs# Leaderboard data service
│   │   └── ...
│   └── Interfaces/          # Service interfaces
│       ├── IAIService.cs    # AI service interface
│       ├── IFlashcardService.cs # Flashcard service interface
│       └── ...
├── Infrastructure/          # Infrastructure services
│   ├── SupabaseService.cs   # Supabase client configuration
│   └── ...
├── Settings/                # Configuration settings
│   ├── OpenAISettings.cs    # OpenAI configuration
│   ├── SupabaseSettings.cs  # Supabase configuration
│   └── ...
├── appsettings.json         # Application settings
├── Program.cs               # Application entry point
└── Lithuaningo.API.csproj   # Project file
```

## Implementation Details

### Frontend Implementation

#### 1. Main Screen Components

**Flashcard Screen (index.tsx)**

```typescript
import React, { useEffect } from "react";
import { View } from "react-native";
import { useFlashcards } from "../hooks/useFlashcards";
import { FlashcardCard } from "../components/ui/Card";
import { Screen } from "../components/layout/Screen";
import { Button } from "../components/ui/Button";
import { useTheme } from "react-native-paper";
import { useSubscription } from "../hooks/useSubscription";

export default function FlashcardScreen() {
  const {
    flashcards,
    isLoading,
    fetchFlashcards,
    currentIndex,
    nextCard,
    previousCard,
  } = useFlashcards();
  const { isSubscribed, freeCardLimit, cardCount } = useSubscription();
  const theme = useTheme();

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const isLimited = !isSubscribed && cardCount >= freeCardLimit;

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {flashcards.length > 0 && (
          <FlashcardCard
            flashcard={flashcards[currentIndex]}
            onNext={nextCard}
            onPrevious={previousCard}
          />
        )}
        <Button
          mode="contained"
          onPress={() => fetchFlashcards()}
          loading={isLoading}
          disabled={isLimited}
          style={{ marginTop: 20 }}
        >
          Generate New Flashcards
        </Button>

        {isLimited && (
          <Button
            mode="outlined"
            onPress={() => router.push("/premium")}
            style={{ marginTop: 10 }}
          >
            Upgrade to Premium
          </Button>
        )}
      </View>
    </Screen>
  );
}
```

**Challenges Screen (challenges.tsx)**

```typescript
import React, { useEffect } from "react";
import { View, FlatList } from "react-native";
import { useChallenges } from "../hooks/useChallenges";
import { ChallengeItem } from "../components/ui/Challenge";
import { Screen } from "../components/layout/Screen";
import { Button } from "../components/ui/Button";
import { Text } from "react-native-paper";
import { useSubscription } from "../hooks/useSubscription";
import { router } from "expo-router";

export default function ChallengesScreen() {
  const { challenges, isLoading, fetchChallenges, submitAnswer, currentScore } =
    useChallenges();
  const { isSubscribed, freeChallengeLimit, challengeCount } =
    useSubscription();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const isLimited = !isSubscribed && challengeCount >= freeChallengeLimit;

  return (
    <Screen>
      <View style={{ padding: 16 }}>
        <Text variant="headlineMedium">Challenges</Text>
        <Text variant="titleMedium">Current Score: {currentScore}</Text>

        <FlatList
          data={challenges}
          renderItem={({ item }) => (
            <ChallengeItem
              challenge={item}
              onAnswer={(answer) => submitAnswer(item.id, answer)}
              disabled={isLimited}
            />
          )}
          keyExtractor={(item) => item.id}
        />

        <Button
          mode="contained"
          onPress={() => fetchChallenges()}
          loading={isLoading}
          disabled={isLimited}
          style={{ marginTop: 20 }}
        >
          Generate New Challenges
        </Button>

        {isLimited && (
          <Button
            mode="outlined"
            onPress={() => router.push("/premium")}
            style={{ marginTop: 10 }}
          >
            Upgrade to Premium
          </Button>
        )}
      </View>
    </Screen>
  );
}
```

**Premium Screen (premium.tsx)**

```typescript
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, Card, Button, List, useTheme } from "react-native-paper";
import { Screen } from "../components/layout/Screen";
import { useSubscription } from "../hooks/useSubscription";

export default function PremiumScreen() {
  const theme = useTheme();
  const {
    isSubscribed,
    subscriptionPlans,
    currentPlan,
    purchaseSubscription,
    isLoading,
  } = useSubscription();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          variant="headlineMedium"
          style={{ textAlign: "center", marginBottom: 20 }}
        >
          Upgrade to Premium
        </Text>

        {isSubscribed ? (
          <Card style={{ marginBottom: 20 }}>
            <Card.Content>
              <Text variant="titleLarge" style={{ marginBottom: 10 }}>
                You're a Premium Member!
              </Text>
              <Text variant="bodyMedium">
                You have unlimited access to all features. Your {currentPlan}{" "}
                subscription is active.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Card style={{ marginBottom: 20 }}>
              <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 10 }}>
                  Free Plan Limitations:
                </Text>
                <List.Item
                  title="5 flashcards per day"
                  left={(props) => (
                    <List.Icon {...props} icon="card-text-outline" />
                  )}
                />
                <List.Item
                  title="3 challenges per day"
                  left={(props) => (
                    <List.Icon {...props} icon="clipboard-check-outline" />
                  )}
                />
                <List.Item
                  title="Basic leaderboard access"
                  left={(props) => (
                    <List.Icon {...props} icon="trophy-outline" />
                  )}
                />
              </Card.Content>
            </Card>

            <Text
              variant="titleLarge"
              style={{ marginBottom: 10, textAlign: "center" }}
            >
              Premium Benefits
            </Text>

            <List.Item
              title="Unlimited flashcards"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="check-circle"
                  color={theme.colors.primary}
                />
              )}
            />
            <List.Item
              title="Unlimited challenges"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="check-circle"
                  color={theme.colors.primary}
                />
              )}
            />
            <List.Item
              title="Advanced statistics"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="check-circle"
                  color={theme.colors.primary}
                />
              )}
            />
            <List.Item
              title="Offline mode"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="check-circle"
                  color={theme.colors.primary}
                />
              )}
            />

            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} style={styles.planCard}>
                <Card.Content>
                  <Text variant="titleLarge">{plan.name}</Text>
                  <Text variant="titleMedium" style={{ marginVertical: 10 }}>
                    {plan.localizedPrice}
                  </Text>
                  <Text variant="bodyMedium">{plan.description}</Text>
                </Card.Content>
                <Card.Actions>
                  <Button
                    mode="contained"
                    loading={isLoading}
                    onPress={() => purchaseSubscription(plan.id)}
                  >
                    Subscribe
                  </Button>
                </Card.Actions>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  planCard: {
    marginVertical: 10,
  },
});
```

#### 2. Core Hooks

**useFlashcards.ts**

```typescript
import { useState } from "react";
import { api } from "../services/api";
import { useFlashcardStore } from "../stores/flashcardStore";
import { useSubscription } from "./useSubscription";

export const useFlashcards = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { flashcards, setFlashcards, currentIndex, setCurrentIndex } =
    useFlashcardStore();
  const { incrementCardCount, isSubscribed } = useSubscription();

  const fetchFlashcards = async (topic = "basic vocabulary") => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/flashcards", { params: { topic } });
      setFlashcards(response.data);
      setCurrentIndex(0);
      if (!isSubscribed) {
        incrementCardCount();
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return {
    flashcards,
    isLoading,
    fetchFlashcards,
    currentIndex,
    nextCard,
    previousCard,
  };
};
```

**useSubscription.ts**

```typescript
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useSubscriptionStore } from "../stores/subscriptionStore";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
} from "react-native-purchases";

export const useSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const {
    isSubscribed,
    setIsSubscribed,
    currentPlan,
    setCurrentPlan,
    cardCount,
    challengeCount,
    incrementCardCount,
    incrementChallengeCount,
    resetCounts,
  } = useSubscriptionStore();

  const freeCardLimit = 5;
  const freeChallengeLimit = 3;

  useEffect(() => {
    const initPurchases = async () => {
      if (Platform.OS === "android") {
        await Purchases.configure({ apiKey: "goog_YOUR_API_KEY" });
      } else if (Platform.OS === "ios") {
        await Purchases.configure({ apiKey: "appl_YOUR_API_KEY" });
      }

      const offerings = await Purchases.getOfferings();
      setOfferings(offerings.current);

      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      checkSubscriptionStatus(info);
    };

    initPurchases();
  }, []);

  const checkSubscriptionStatus = (info: CustomerInfo) => {
    const isPremium =
      typeof info.entitlements.active["premium"] !== "undefined";
    setIsSubscribed(isPremium);

    if (isPremium) {
      // Determine which plan (monthly/annual)
      const planId = Object.keys(info.activeSubscriptions)[0] || "";
      setCurrentPlan(planId.includes("annual") ? "annual" : "monthly");
    }
  };

  const purchaseSubscription = async (packageId: string) => {
    setIsLoading(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage({
        identifier: packageId,
      });
      setCustomerInfo(customerInfo);
      checkSubscriptionStatus(customerInfo);

      if (typeof customerInfo.entitlements.active["premium"] !== "undefined") {
        resetCounts(); // Reset usage counters once subscribed
      }
    } catch (error) {
      console.error("Error purchasing subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscriptionPlans = offerings
    ? offerings.availablePackages.map((pkg) => ({
        id: pkg.identifier,
        name: pkg.identifier.includes("annual")
          ? "Annual Plan"
          : "Monthly Plan",
        localizedPrice: pkg.product.priceString,
        description: pkg.identifier.includes("annual")
          ? "Save 30% compared to monthly billing"
          : "Full access with flexible monthly billing",
      }))
    : [];

  return {
    isSubscribed,
    currentPlan,
    subscriptionPlans,
    purchaseSubscription,
    isLoading,
    cardCount,
    challengeCount,
    freeCardLimit,
    freeChallengeLimit,
    incrementCardCount,
    incrementChallengeCount,
  };
};
```

**useChallenges.ts**

```typescript
import { useState } from "react";
import { api } from "../services/api";
import { useChallengeStore } from "../stores/challengeStore";
import { useDeviceId } from "./useDeviceId";
import { calculateScore } from "../utils/scoring";
import { useSubscription } from "./useSubscription";

export const useChallenges = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    challenges,
    setChallengers,
    currentScore,
    setCurrentScore,
    addAnswer,
  } = useChallengeStore();
  const { deviceId } = useDeviceId();
  const { incrementChallengeCount, isSubscribed } = useSubscription();

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/challenges");
      setChallengers(response.data);
      setCurrentScore(0);
      if (!isSubscribed) {
        incrementChallengeCount();
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (challengeId, answer) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    const isCorrect = challenge.correctAnswer === answer;

    addAnswer(challengeId, answer, isCorrect);

    if (isCorrect) {
      const points = calculateScore(challenge.type);
      setCurrentScore(currentScore + points);

      // Submit score to leaderboard
      try {
        await api.post("/api/leaderboard", {
          deviceId,
          score: points,
          challengeType: challenge.type,
        });
      } catch (error) {
        console.error("Error submitting score:", error);
      }
    }
  };

  return {
    challenges,
    isLoading,
    fetchChallenges,
    submitAnswer,
    currentScore,
  };
};
```

### Backend Implementation

#### 1. Controller Implementations

**FlashcardController.cs**

```csharp
using Lithuaningo.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class FlashcardsController : ControllerBase
{
    private readonly IFlashcardService _flashcardService;
    private readonly IAIService _aiService;
    private readonly ILogger<FlashcardsController> _logger;

    public FlashcardsController(
        IFlashcardService flashcardService,
        IAIService aiService,
        ILogger<FlashcardsController> logger)
    {
        _flashcardService = flashcardService;
        _aiService = aiService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetFlashcards([FromQuery] string topic = "basic vocabulary", [FromQuery] int count = 10)
    {
        try
        {
            var flashcards = await _flashcardService.GenerateFlashcardsAsync(topic, count);
            return Ok(flashcards);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating flashcards");
            return StatusCode(500, "An error occurred while generating flashcards");
        }
    }
}
```

#### 2. Service Implementations

**SupabaseService.cs**

```csharp
using Supabase;
using Supabase.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

public class SupabaseService
{
    private readonly Client _supabaseClient;
    private readonly ILogger<SupabaseService> _logger;

    public SupabaseService(IOptions<SupabaseSettings> supabaseSettings, ILogger<SupabaseService> logger)
    {
        _logger = logger;
        var settings = supabaseSettings.Value;

        _supabaseClient = new Client(
            settings.Url,
            settings.Key,
            new ClientOptions { AutoConnectRealtime = true });
    }

    public Client GetClient()
    {
        return _supabaseClient;
    }

    public Supabase.Storage.BucketApiClient GetStorage(string bucket)
    {
        return _supabaseClient.Storage.From(bucket);
    }
}
```

**LeaderboardService.cs**

```csharp
using Lithuaningo.API.DTOs;
using Lithuaningo.API.Services.Interfaces;
using System.Text.Json;

public class LeaderboardService : ILeaderboardService
{
    private readonly SupabaseService _supabaseService;
    private readonly ILogger<LeaderboardService> _logger;

    public LeaderboardService(
        SupabaseService supabaseService,
        ILogger<LeaderboardService> logger)
    {
        _supabaseService = supabaseService;
        _logger = logger;
    }

    public async Task<IEnumerable<LeaderboardEntryDto>> GetTopScoresAsync(int limit)
    {
        _logger.LogInformation("Getting top {Limit} scores from leaderboard", limit);

        try
        {
            var client = _supabaseService.GetClient();
            var response = await client.From<Models.LeaderboardEntry>()
                .Select("*")
                .Order("score", Supabase.Postgrest.Constants.QueryOrder.Descending)
                .Limit(limit)
                .Get();

            return response.Models.Select(e => new LeaderboardEntryDto
            {
                Id = e.Id.ToString(),
                DeviceId = e.DeviceId,
                Score = e.Score,
                DateAchieved = e.DateAchieved
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leaderboard from Supabase");
            throw;
        }
    }

    public async Task<LeaderboardEntryDto> AddScoreAsync(LeaderboardEntryDto entryDto)
    {
        _logger.LogInformation("Adding new score {Score} for device {DeviceId}", entryDto.Score, entryDto.DeviceId);

        try
        {
            var entry = new Models.LeaderboardEntry
            {
                DeviceId = entryDto.DeviceId,
                Score = entryDto.Score,
                DateAchieved = DateTime.UtcNow
            };

            var client = _supabaseService.GetClient();
            var response = await client.From<Models.LeaderboardEntry>()
                .Insert(entry);

            var result = response.Models.FirstOrDefault();
            if (result == null)
            {
                throw new Exception("Failed to insert leaderboard entry");
            }

            return new LeaderboardEntryDto
            {
                Id = result.Id.ToString(),
                DeviceId = result.DeviceId,
                Score = result.Score,
                DateAchieved = result.DateAchieved
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding leaderboard entry to Supabase");
            throw;
        }
    }
}
```

## API Endpoints

### Flashcards API

- `GET /api/flashcards` - Get AI-generated flashcards
  - Query Parameters:
    - `topic` (optional) - Topic for flashcard generation (default: "basic vocabulary")
    - `count` (optional) - Number of flashcards to generate (default: 10)
  - Response: Array of Flashcard objects

### Challenges API

- `GET /api/challenges` - Get AI-generated challenges
  - Query Parameters:
    - `difficulty` (optional) - Difficulty level (default: "beginner")
    - `count` (optional) - Number of challenges to generate (default: 5)
  - Response: Array of Challenge objects

### Leaderboard API

- `GET /api/leaderboard` - Get top scores

  - Query Parameters:
    - `limit` (optional) - Number of entries to return (default: 20)
  - Response: Array of LeaderboardEntry objects

- `POST /api/leaderboard` - Add a new score
  - Request Body: LeaderboardEntry object
  - Response: Created LeaderboardEntry object

## Monetization Strategy

The application uses RevenueCat to implement a freemium business model:

### Free Tier

- Limited to 5 flashcards per day
- Limited to 3 challenges per day
- Basic leaderboard access

### Premium Subscription

- Unlimited flashcards and challenges
- Advanced statistics and tracking
- Offline mode support
- Available as monthly or annual subscription (with discount)

## Deployment Instructions

### Frontend Deployment

1. Build the Expo app for production:

   ```bash
   npx expo prebuild
   eas build --platform ios
   eas build --platform android
   ```

2. Submit to app stores:
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

### Backend Deployment

1. Publish the .NET API:

   ```bash
   dotnet publish -c Release
   ```

2. Deploy to Azure App Service:
   ```bash
   az webapp up --sku F1 --name lithuaningo-api
   ```

## Development Setup

### Frontend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/lithuaningo.git
   cd lithuaningo
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   ```
   EXPO_PUBLIC_API_URL=your-api-url
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```bash
   npx expo start
   ```

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/lithuaningo-api.git
   cd lithuaningo-api
   ```

2. Set up your environment variables in appsettings.Development.json:

   ```json
   {
     "OpenAI": {
       "ApiKey": "your-openai-api-key"
     },
     "Supabase": {
       "Url": "your-supabase-url",
       "Key": "your-supabase-service-role-key"
     }
   }
   ```

3. Run the API:
   ```bash
   dotnet run
   ```

## Future Enhancements

1. Offline mode for premium subscribers
2. Daily challenges with streak rewards
3. Achievement system
4. Advanced analytics for premium users
5. Pronunciation audio
6. Multiple language support

## License

MIT License
