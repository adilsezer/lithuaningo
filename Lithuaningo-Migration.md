# Lithuaningo - AI-Powered Lithuanian Language Learning

A streamlined Lithuanian language learning application with AI-generated content focused on three core features: Flashcards, Challenges, and Leaderboards.

## Project Overview

Lithuaningo is a Lithuanian language learning platform focusing on delivering an efficient learning experience through AI-generated content. The application uses Supabase for authentication and database management, providing a streamlined learning experience with user accounts to track progress.

### Core Features

1. **AI-Generated Flashcards** - Lithuanian vocabulary with translations and example sentences
2. **AI-Generated Challenges** - Multiple choice, true/false, and fill-in-the-blank exercises
3. **Weekly Leaderboard** - Score tracking with weekly resets based on Challenges
4. **Premium Subscription** - Limited free access with premium features via monthly/annual subscription
5. **User Authentication** - Email/password, Google, and Apple Sign In options
6. **Lithuanian AI Assistant** - AI chat that answers Lithuanian-related questions
7. **Sleek Modern UI** - Minimal, clean interface built with React Native Paper
8. **Dark/Light Mode** - User-selectable theme with custom UI components

### Technical Stack

#### Frontend

- React Native (latest version)
- Expo SDK (latest version)
- Expo Development Build for authentication testing (Apple/Google Sign In)
- Expo Go for early-stage development (excluding authentication features)
- TypeScript
- React Native Paper for UI components with a consistent design system
- Bottom tabs navigation for intuitive app navigation
- Zustand for state management
- AsyncStorage for local data persistence
- Expo Router for navigation
- RevenueCat for in-app subscription management
- React Hook Form for form handling with validation
- Zod for schema validation and type-safe forms
- Axios for API requests
- Amplitude for analytics
- Sentry for error tracking
- OneSignal for push notifications
- Supabase Auth UI for authentication flows

#### Backend

- .NET 8 Web API
- OpenAI integration for content generation and AI chat
- Supabase for authentication and database
- Cloudflare R2 with CDN for image storage
- Memory cache for performance optimization
- Azure App Service hosting

## Project Structure

Following Expo Router's [top-level src directory pattern](https://docs.expo.dev/router/reference/src-directory/), the project is organized as follows:

```
lithuaningo/
├── mobile/                  # React Native mobile app
│   ├── assets/              # Images, fonts, and static assets
│   ├── src/                 # Source code (top-level src directory)
│   │   ├── app/             # Expo Router app directory
│   │   │   ├── _layout.tsx      # Root layout with auth check (actual root component)
│   │   │   ├── index.tsx        # Initial redirect screen
│   │   │   ├── auth/            # Authentication screens
│   │   │   │   ├── _layout.tsx  # Auth navigation layout
│   │   │   │   ├── index.tsx    # Welcome screen
│   │   │   │   ├── login.tsx    # Login screen
│   │   │   │   ├── signup.tsx   # Registration screen
│   │   │   │   └── forgot-password.tsx # Password reset
│   │   │   └── (app)/          # Main app (post-authentication)
│   │   │       ├── _layout.tsx  # Bottom tabs configuration
│   │   │       ├── index.tsx    # Home screen (dashboard)
│   │   │       ├── flashcards/  # Flashcards screens
│   │   │       │   └── index.tsx
│   │   │       ├── challenges/  # Challenges screens
│   │   │       │   └── index.tsx
│   │   │       ├── leaderboard/ # Leaderboard screens
│   │   │       │   └── index.tsx
│   │   │       ├── profile/     # Profile screens
│   │   │       │   ├── index.tsx
│   │   │       │   ├── edit.tsx
│   │   │       │   └── settings.tsx
│   │   │       └── chat/        # AI chat screens
│   │   │           └── index.tsx
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/          # Basic UI components
│   │   │   │   ├── FlashcardCard.tsx # Flashcard component
│   │   │   │   ├── Challenge.tsx # Challenge component
│   │   │   │   ├── CustomButton.tsx # Standard button component
│   │   │   │   ├── CustomSwitch.tsx # Toggle switch with label
│   │   │   │   ├── CustomText.tsx # Text component with variant support
│   │   │   │   └── ...
│   │   │   └── layout/      # Layout components
│   │   │       ├── Screen.tsx # Screen wrapper component
│   │   │       └── ...
│   │   ├── hooks/           # Custom hooks
│   │   │   ├── useFlashcards.ts # Flashcard data fetching and management
│   │   │   ├── useChallenges.ts # Challenge data fetching and management
│   │   │   ├── useLeaderboard.ts # Leaderboard data fetching
│   │   │   ├── useAuth.ts    # Authentication hook
│   │   │   ├── useProfile.ts # Profile management
│   │   │   ├── useChat.ts    # AI chat functionality
│   │   │   ├── useWelcome.ts # Welcome screen logic and navigation
│   │   │   ├── useTheme.ts   # Theme management hook
│   │   │   └── useSubscription.ts # RevenueCat subscription management
│   │   ├── services/        # API and service integrations
│   │   │   ├── api.ts       # API client and request handlers
│   │   │   ├── storage.ts   # Local storage utilities
│   │   │   ├── supabase.ts  # Supabase client configuration
│   │   │   └── chat.ts      # Chat service with OpenAI
│   │   ├── stores/          # State management
│   │   │   ├── flashcardStore.ts # Flashcard state management
│   │   │   ├── challengeStore.ts # Challenge state management
│   │   │   ├── authStore.ts  # Authentication state
│   │   │   ├── subscriptionStore.ts # Subscription state management
│   │   │   ├── chatStore.ts  # Chat history and state
│   │   │   └── appStore.ts  # App-wide state management
│   │   ├── styles/          # Styling and themes
│   │   │   ├── theme.ts     # Application theme configuration
│   │   │   └── typography.ts # Typography styles
│   │   └── utils/           # Utility functions
│   │       ├── scoring.ts   # Score calculation utilities
│   │       └── weekId.ts    # Week calculation for leaderboard
│   ├── App.tsx              # Minimal entry point that imports expo-router/entry
│   ├── app.json             # Expo configuration
│   ├── babel.config.js      # Babel configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── package.json         # Dependencies and scripts
│
├── web/                     # Future web implementation placeholder
│   └── README.md            # Placeholder for web implementation
│
├── backend/                 # Backend services
│   ├── Lithuaningo.API/     # .NET 8 Web API
│   │   ├── Controllers/     # API endpoints
│   │   │   ├── FlashcardController.cs  # Flashcard endpoints
│   │   │   ├── ChallengeController.cs  # Challenge endpoints
│   │   │   ├── LeaderboardController.cs# Leaderboard endpoints
│   │   │   └── AppUpdateController.cs  # App update endpoints
│   │   ├── Models/          # Domain models
│   │   │   ├── Flashcard.cs # Flashcard model
│   │   │   ├── Challenge.cs # Challenge model
│   │   │   ├── LeaderboardEntry.cs # Leaderboard entry model
│   │   │   ├── AppUpdate.cs # App update model
│   │   │   │   └── ...
│   │   │   ├── DTOs/            # Data transfer objects
│   │   │   │   ├── FlashcardDto.cs # Flashcard DTOs
│   │   │   │   ├── ChallengeDto.cs # Challenge DTOs
│   │   │   │   ├── LeaderboardDto.cs # Leaderboard DTOs
│   │   │   │   └── ...
│   │   │   ├── Services/        # Service implementations
│   │   │   │   ├── AI/
│   │   │   │   │   ├── AIService.cs # OpenAI integration service
│   │   │   │   │   └── ...
│   │   │   │   ├── Data/
│   │   │   │   │   ├── FlashcardService.cs # Flashcard data service
│   │   │   │   ├── ChallengeService.cs # Challenge data service
│   │   │   │   ├── LeaderboardService.cs# Leaderboard data service
│   │   │   │   ├── AppUpdateService.cs# App update service
│   │   │   │   └── ...
│   │   │   └── Interfaces/  # Service interfaces
│   │   │       ├── IAIService.cs # AI service interface
│   │   │       ├── IFlashcardService.cs # Flashcard service interface
│   │   │       └── ...
│   │   ├── Infrastructure/  # Infrastructure services
│   │   │   ├── SupabaseService.cs # Supabase client configuration
│   │   │   └── ...
│   │   ├── Settings/        # Configuration settings
│   │   │   ├── OpenAISettings.cs # OpenAI configuration
│   │   │   ├── SupabaseSettings.cs # Supabase configuration
│   │   │   └── ...
│   │   ├── appsettings.json # Application settings
│   │   ├── Program.cs       # Application entry point
│   │   └── Lithuaningo.API.csproj # Project file
│   │
│   ├── Lithuaningo.Common/  # Shared libraries and utilities
│   │   └── README.md        # Placeholder for common components
│   │
│   └── Lithuaningo.Tests/   # Test projects
│       └── README.md        # Placeholder for tests
│
└── README.md                # Main project documentation
```

## Implementation Details

### Frontend Implementation

#### 1. Main Screen Components

**Welcome Screen (src/app/auth/index.tsx)**

```typescript
import React from "react";
import { ScrollView, View, Image, StyleSheet } from "react-native";
import CustomButton from "@/components/ui/CustomButton";
import CustomSwitch from "@/components/ui/CustomSwitch";
import CustomText from "@/components/ui/CustomText";
import { useWelcome } from "@/hooks/useWelcome";

const WelcomeScreen = () => {
  const { isDarkMode, toggleTheme, navigateToAuth } = useWelcome();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <CustomSwitch
          onValueChange={toggleTheme}
          value={isDarkMode}
          label="Dark Mode"
        />
        <WelcomeImage />
        <WelcomeText />
        <AuthButtons onNavigate={navigateToAuth} />
      </View>
    </ScrollView>
  );
};

const WelcomeImage = () => (
  <View style={styles.imageContainer}>
    <Image
      source={require("assets/images/welcome-image.png")}
      style={styles.image}
      accessibilityLabel="Welcome to Lithuaningo"
    />
  </View>
);

const WelcomeText = () => (
  <View style={styles.textContainer}>
    <CustomText variant="headlineMedium" bold>
      Welcome to Lithuaningo
    </CustomText>
    <CustomText variant="bodyLarge">
      Learn Lithuanian with daily sentences, flashcards, and reinforcing
      challenges.
    </CustomText>
    <CustomText variant="bodyLarge">
      Join now and compete on our leaderboard!
    </CustomText>
  </View>
);

const AuthButtons = ({
  onNavigate,
}: {
  onNavigate: (route: "login" | "signup") => void;
}) => (
  <View style={styles.buttonContainer}>
    <CustomButton onPress={() => onNavigate("login")} title="Log In" />
    <CustomButton onPress={() => onNavigate("signup")} title="Create Account" />
  </View>
);

export default WelcomeScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  buttonContainer: {
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 10,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
  },
  sectionSpacing: {
    marginTop: 10,
  },
});
```

The welcome screen follows a modular design approach with custom UI components. It implements an authentication-first flow, requiring users to log in or create an account before accessing the app's features. Key components include:

1. **Theme Toggle** - A custom switch component that allows users to toggle between light and dark modes
2. **Welcome Image** - A prominent featured image to create visual appeal
3. **Welcome Text** - Clear messaging explaining the app's purpose and value proposition
4. **Authentication Buttons** - Direct options for logging in or creating a new account

This design emphasizes simplicity and user engagement while establishing the requirement for authentication from the start. The modular structure using component composition improves code maintainability and reusability.

**Flashcard Screen (src/app/(app)/flashcards/index.tsx)**

```typescript
import React, { useEffect } from "react";
import { View } from "react-native";
import { useFlashcards } from "@/hooks/useFlashcards";
import { FlashcardCard } from "@/components/ui/FlashcardCard";
import { Screen } from "@/components/layout/Screen";
import { CustomButton } from "@/components/ui/CustomButton";
import { useTheme } from "react-native-paper";
import { useSubscription } from "@/hooks/useSubscription";
import { router } from "expo-router";

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
        <CustomButton
          title="Generate New Flashcards"
          onPress={() => fetchFlashcards()}
          loading={isLoading}
          disabled={isLimited}
          style={{ marginTop: 20 }}
        />

        {isLimited && (
          <CustomButton
            title="Upgrade to Premium"
            onPress={() => router.push("/premium")}
            mode="outlined"
            style={{ marginTop: 10 }}
          />
        )}
      </View>
    </Screen>
  );
}
```

**Challenges Screen (src/app/(app)/challenges/index.tsx)**

```typescript
import React, { useEffect } from "react";
import { View, FlatList } from "react-native";
import { useChallenges } from "@/hooks/useChallenges";
import { ChallengeItem } from "@/components/ui/Challenge";
import { Screen } from "@/components/layout/Screen";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomText } from "@/components/ui/CustomText";
import { useSubscription } from "@/hooks/useSubscription";
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
        <CustomText variant="headlineMedium">Challenges</CustomText>
        <CustomText variant="titleMedium">
          Current Score: {currentScore}
        </CustomText>

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

        <CustomButton
          title="Generate New Challenges"
          onPress={() => fetchChallenges()}
          loading={isLoading}
          disabled={isLimited}
          style={{ marginTop: 20 }}
        />

        {isLimited && (
          <CustomButton
            title="Upgrade to Premium"
            onPress={() => router.push("/premium")}
            mode="outlined"
            style={{ marginTop: 10 }}
          />
        )}
      </View>
    </Screen>
  );
}
```

**Premium Screen (src/app/(app)/premium/index.tsx)**

```typescript
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Card, List, useTheme } from "react-native-paper";
import { Screen } from "@/components/layout/Screen";
import { CustomText } from "@/components/ui/CustomText";
import { CustomButton } from "@/components/ui/CustomButton";
import { useSubscription } from "@/hooks/useSubscription";

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
        <CustomText
          variant="headlineMedium"
          style={{ textAlign: "center", marginBottom: 20 }}
        >
          Upgrade to Premium
        </CustomText>

        {isSubscribed ? (
          <Card style={{ marginBottom: 20 }}>
            <Card.Content>
              <CustomText variant="titleLarge" style={{ marginBottom: 10 }}>
                You're a Premium Member!
              </CustomText>
              <CustomText variant="bodyMedium">
                You have unlimited access to all features. Your {currentPlan}{" "}
                subscription is active.
              </CustomText>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Card style={{ marginBottom: 20 }}>
              <Card.Content>
                <CustomText variant="titleMedium" style={{ marginBottom: 10 }}>
                  Free Plan Limitations:
                </CustomText>
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

            <CustomText
              variant="titleLarge"
              style={{ marginBottom: 10, textAlign: "center" }}
            >
              Premium Benefits
            </CustomText>

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
                  <CustomText variant="titleLarge">{plan.name}</CustomText>
                  <CustomText
                    variant="titleMedium"
                    style={{ marginVertical: 10 }}
                  >
                    {plan.localizedPrice}
                  </CustomText>
                  <CustomText variant="bodyMedium">
                    {plan.description}
                  </CustomText>
                </Card.Content>
                <Card.Actions>
                  <CustomButton
                    title="Subscribe"
                    mode="contained"
                    loading={isLoading}
                    onPress={() => purchaseSubscription(plan.id)}
                  />
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
  const { isSubscribed } = useSubscription();

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

The backend API implements several key services that work together:

1. **Authentication Service**: Integrates with Supabase Auth for user management
2. **Content Generation**: Uses OpenAI to generate flashcards and challenges
3. **Leaderboard Management**: Handles weekly leaderboard calculations and resets
4. **Image Storage**: Manages uploads and retrieval from Cloudflare R2
5. **Caching Layer**: Implements memory caching with optional Redis support for distributed scenarios

The API endpoints follow a consistent RESTful pattern and are secured using JWT tokens from Supabase Auth. The controllers delegate to appropriate services, which handle database operations through the Supabase client.

### Development to Production Workflow

The application uses a streamlined development-to-production workflow:

1. **Early Development**:

   - Initial development using Expo Go for non-native features
   - Supabase local development for database
   - Local .NET API with development settings

2. **Authentication Development**:

   - Create Expo Development Build with `eas build --profile development`
   - Test Apple Sign In and Google Sign In on actual devices
   - Complete authentication flow testing on development builds

3. **Testing**:

   - Expo development builds for all device testing
   - Test database environment on Supabase
   - Staging API on Azure

4. **Production**:
   - EAS Build for app store submissions
   - Production Supabase instance
   - Production API on Azure App Service

This approach ensures consistent behavior across environments while optimizing the development experience.

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
   cd lithuaningo/mobile
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables by creating a `.env` file:

   ```
   EXPO_PUBLIC_API_URL=your-api-url
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Configure path aliases in `tsconfig.json`:

   ```json
   {
     "extends": "expo/tsconfig.base",
     "compilerOptions": {
       "strict": true,
       "paths": {
         "@/*": ["./src/*"],
         "@components/*": ["./src/components/*"],
         "@hooks/*": ["./src/hooks/*"],
         "@services/*": ["./src/services/*"],
         "@stores/*": ["./src/stores/*"],
         "@styles/*": ["./src/styles/*"],
         "@utils/*": ["./src/utils/*"],
         "@app/*": ["./src/app/*"]
       }
     }
   }
   ```

5. Configure Babel module resolver in `babel.config.js`:

   ```javascript
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: ["babel-preset-expo"],
       plugins: [
         [
           "module-resolver",
           {
             alias: {
               "@": "./src",
               "@components": "./src/components",
               "@hooks": "./src/hooks",
               "@services": "./src/services",
               "@stores": "./src/stores",
               "@styles": "./src/styles",
               "@utils": "./src/utils",
               "@app": "./src/app",
             },
           },
         ],
       ],
     };
   };
   ```

6. Set up the top-level src directory structure:

   ```bash
   # Create the src directory and move app directory into it
   mkdir -p src/app

   # If you're creating a new project, simply organize files in this structure
   # If migrating an existing project, move your app directory into src:
   # mv app src/

   # Then create other necessary directories
   mkdir -p src/components/ui src/components/layout
   mkdir -p src/hooks src/services src/stores src/styles src/utils
   ```

7. For early development (except authentication features):

   ```bash
   npx expo start
   ```

8. For development with authentication (Apple/Google Sign In):

   ```bash
   # Configure EAS Build first
   eas build:configure

   # Create eas.json configuration
   ```

   ```json
   // eas.json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal",
         "ios": {
           "simulator": true
         },
         "android": {
           "buildType": "apk"
         }
       },
       "preview": {
         "distribution": "internal"
       },
       "production": {}
     }
   }
   ```

   ```bash
   # Create a development build
   eas build --profile development --platform ios
   # or
   eas build --profile development --platform android

   # Start development server
   npx expo start --dev-client
   ```

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/lithuaningo.git
   cd lithuaningo/backend/Lithuaningo.API
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

## Architecture and Data Flow

### OpenAI Integration

The application uses OpenAI to generate language learning content:

1. **Flashcard Generation**: OpenAI creates Lithuanian vocabulary words, translations, example sentences, and usage contexts.
2. **Challenge Creation**: AI generates multiple-choice questions, true/false statements, and fill-in-the-blank exercises.
3. **Difficulty Leveling**: Content is generated according to specified difficulty levels (beginner, intermediate, advanced).

### Cloudflare R2 Storage

Images for flashcards are stored in Cloudflare R2 with CDN:

1. **Image Generation**: AI-generated or curated images representing flashcard concepts
2. **CDN Distribution**: Fast global delivery of images via Cloudflare's CDN
3. **Storage Organization**: Images organized by categories and difficulty levels

### Database Structure

The Supabase database structure includes authentication and user profiles:

#### Tables

**profiles**

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON profiles(username);
```

**user_settings**

```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_enabled BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'light',
    language_preference TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**flashcards**

```sql
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lithuanian_word TEXT NOT NULL,
    english_translation TEXT NOT NULL,
    part_of_speech TEXT,
    example_sentence TEXT,
    example_translation TEXT,
    difficulty_level TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[]
);

CREATE INDEX idx_flashcards_difficulty ON flashcards(difficulty_level);
CREATE INDEX idx_flashcards_category ON flashcards(category);
CREATE INDEX idx_flashcards_tags ON flashcards USING GIN(tags);
```

**challenges**

```sql
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_type TEXT NOT NULL,
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    options JSONB,
    difficulty_level TEXT NOT NULL,
    category TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[]
);

CREATE INDEX idx_challenges_type_difficulty ON challenges(challenge_type, difficulty_level);
CREATE INDEX idx_challenges_category ON challenges(category);
CREATE INDEX idx_challenges_tags ON challenges USING GIN(tags);
```

**leaderboard**

```sql
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    challenge_type TEXT,
    week_id INTEGER NOT NULL,
    rank INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    week_start_date DATE,
    week_end_date DATE,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_date ON leaderboard(achieved_at DESC);
CREATE INDEX idx_leaderboard_week ON leaderboard(week_id);
CREATE INDEX idx_leaderboard_active ON leaderboard(is_active);
CREATE INDEX idx_leaderboard_user_week ON leaderboard(user_id, week_id);
```

**app_updates**

```sql
CREATE TABLE app_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL, -- 'ios' or 'android'
    version TEXT NOT NULL,
    build_number INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT false,
    min_required_version TEXT,
    release_notes TEXT,
    release_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_app_updates_platform ON app_updates(platform);
CREATE UNIQUE INDEX idx_app_updates_platform_version ON app_updates(platform, version);
```

**usage_limits**

```sql
CREATE TABLE usage_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcard_count INTEGER DEFAULT 0,
    challenge_count INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

**assets**

```sql
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_type TEXT NOT NULL,
    r2_key TEXT NOT NULL,
    cdn_url TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assets_type ON assets(asset_type);
```

### Security Policies

```sql
-- Row-Level Security policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated access
CREATE POLICY "Users can access their own profiles"
  ON profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users can access their own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users can access their own usage limits"
  ON usage_limits FOR ALL
  USING (auth.uid() = user_id);
```

### Memory Cache Implementation

The backend uses in-memory caching to optimize performance:

1. **Cached Content Types**:

   - Frequently accessed flashcards and challenges by category and tags
   - Leaderboard data
   - User-specific usage limits

2. **Cache Invalidation Strategy**:

   - Time-based expiration for volatile data
   - Manual invalidation on updates
   - Sliding expiration for frequently accessed items

3. **Distributed Cache Option**:
   - Redis for production environments with multiple instances

## Services Integration

### Amplitude Analytics

The application integrates Amplitude for analytics to track:

- User engagement with flashcards and challenges
- Feature usage patterns
- Conversion rates for premium subscription
- User retention metrics

### Sentry Error Tracking

Sentry integration provides:

- Real-time error tracking and alerting
- Performance monitoring
- User impact assessment
- Crash reporting with context

### OneSignal Push Notifications

Push notifications are implemented with OneSignal to:

- Remind users of daily practice
- Notify about leaderboard changes
- Promote premium features
- Alert users about new content

### Weekly Leaderboard Implementation

The application implements a weekly leaderboard system using a single table:

1. **Week ID Calculation**:

   ```typescript
   // Calculate ISO week number for leaderboard
   export const getWeekId = (date = new Date()) => {
     const d = new Date(date);
     d.setHours(0, 0, 0, 0);
     d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
     const week1 = new Date(d.getFullYear(), 0, 4);
     return (
       1 +
       Math.round(
         ((d.getTime() - week1.getTime()) / 86400000 -
           3 +
           ((week1.getDay() + 6) % 7)) /
           7
       )
     );
   };
   ```

2. **Weekly Reset Process**:

   - Scores are tracked within the current week with `is_active = TRUE`
   - At the end of each week, rankings are calculated and stored in the rank field
   - Records for the completed week are marked as `is_active = FALSE`
   - Users receive notifications about their previous week's ranking

3. **Historical Performance**:
   - Users can view their performance across previous weeks using the same table
   - The application filters by `week_id` to show historical performance
   - Premium users get detailed statistics on their weekly performance trends

### App Update Management

The application uses the `app_updates` table to:

1. **Version Checking**:

   - On app startup, check current version against latest version in database
   - Determine if update is required or optional
   - Display appropriate update prompts to users

2. **Update Notifications**:

   - Push notifications for new app versions
   - In-app banners for optional updates
   - Forced update screens for required updates

3. **Release Notes**:
   - Display what's new in the latest version
   - Highlight key features and improvements

## Implementation Details

### UI Design Philosophy

The application follows a sleek, modern design philosophy with these principles:

1. **Minimalist Approach** - Clean interfaces with focused content and limited distractions
2. **Consistent Component System** - Built on React Native Paper for material design aesthetics
3. **Deliberate Whitespace** - Proper spacing and layout for improved readability
4. **Purposeful Animations** - Subtle transitions that enhance user experience without overwhelming
5. **Accessibility-First** - High contrast, scalable text, and screen reader support
6. **Bottom Tab Navigation** - Intuitive access to main app features through persistent bottom tabs

The design system uses a limited color palette centered around:

- Primary brand color for key actions and emphasis
- Neutral tones for content areas
- Strategic accent colors for notifications and statuses
- Dark and light themes with proper contrast ratios

All UI components are built modularly with clean, reusable code patterns to ensure consistency across the application while keeping the codebase maintainable.

**Component Example (CustomButton.tsx)**

```typescript
import React from "react";
import { StyleSheet } from "react-native";
import { Button as PaperButton, useTheme } from "react-native-paper";

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  mode?: "contained" | "outlined" | "text";
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: object;
};

const CustomButton = ({
  title,
  onPress,
  mode = "contained",
  disabled = false,
  loading = false,
  icon,
  style,
}: CustomButtonProps) => {
  const { colors } = useTheme();

  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      icon={icon}
      style={[
        styles.button,
        mode === "contained" && { backgroundColor: colors.primary },
        mode === "outlined" && { borderColor: colors.primary },
        disabled && { opacity: 0.6 },
        style,
      ]}
      labelStyle={[
        styles.label,
        mode === "outlined" && { color: colors.primary },
        mode === "text" && { color: colors.primary },
      ]}
    >
      {title}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 8,
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CustomButton;
```

This approach to UI development ensures the app maintains its sleek, modern appearance while keeping the code clean and maintainable.

### Authentication Implementation

The application implements a mandatory authentication system that starts from the welcome screen:

1. **Authentication-First Approach**:

   - Users are prompted to log in or create an account directly from the welcome screen
   - No app features are accessible without authentication
   - Clear visual cues guide users toward creating an account or logging in

2. **Authentication Options**:

   - Email/password registration and login
   - Google Sign In integration
   - Apple Sign In integration (for iOS devices)
   - Password reset functionality

3. **Form Handling with React Hook Form and Zod**:

   ```typescript
   // src/hooks/useAuthForms.ts
   import { z } from "zod";
   import { useForm } from "react-hook-form";
   import { zodResolver } from "@hookform/resolvers/zod";

   // Login form schema with Zod
   const loginSchema = z.object({
     email: z.string().email("Please enter a valid email address"),
     password: z.string().min(8, "Password must be at least 8 characters"),
     rememberMe: z.boolean().optional(),
   });

   // Registration form schema with Zod
   const registerSchema = z
     .object({
       email: z.string().email("Please enter a valid email address"),
       password: z.string().min(8, "Password must be at least 8 characters"),
       confirmPassword: z
         .string()
         .min(8, "Password must be at least 8 characters"),
     })
     .refine((data) => data.password === data.confirmPassword, {
       message: "Passwords do not match",
       path: ["confirmPassword"],
     });

   // Type inference from schemas
   type LoginFormValues = z.infer<typeof loginSchema>;
   type RegisterFormValues = z.infer<typeof registerSchema>;

   export const useLoginForm = () => {
     const form = useForm<LoginFormValues>({
       resolver: zodResolver(loginSchema),
       defaultValues: {
         email: "",
         password: "",
         rememberMe: false,
       },
     });

     return form;
   };

   export const useRegisterForm = () => {
     const form = useForm<RegisterFormValues>({
       resolver: zodResolver(registerSchema),
       defaultValues: {
         email: "",
         password: "",
         confirmPassword: "",
       },
     });

     return form;
   };
   ```

4. **Auth Hook Implementation**:

   ```typescript
   // src/hooks/useAuth.ts
   import { useEffect, useState } from "react";
   import { supabase } from "@services/supabase";
   import { useAuthStore } from "@stores/authStore";

   export const useAuth = () => {
     const { session, setSession, clearSession } = useAuthStore();
     const [isAuthenticated, setIsAuthenticated] = useState(false);
     const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
       // Check for existing session on load
       supabase.auth.getSession().then(({ data: { session } }) => {
         setSession(session);
         setIsAuthenticated(!!session);
         setIsLoading(false);
       });

       // Set up auth state change listener
       const {
         data: { subscription },
       } = supabase.auth.onAuthStateChange((_event, session) => {
         setSession(session);
         setIsAuthenticated(!!session);
       });

       return () => subscription.unsubscribe();
     }, []);

     // Auth methods
     const signIn = async (email, password) => {
       setIsLoading(true);
       const { error } = await supabase.auth.signInWithPassword({
         email,
         password,
       });
       setIsLoading(false);
       return { error };
     };

     const signUp = async (email, password) => {
       setIsLoading(true);
       const { error } = await supabase.auth.signUp({
         email,
         password,
       });
       setIsLoading(false);
       return { error };
     };

     const signOut = async () => {
       setIsLoading(true);
       const { error } = await supabase.auth.signOut();
       clearSession();
       setIsLoading(false);
       return { error };
     };

     return {
       isAuthenticated,
       isLoading,
       session,
       signIn,
       signUp,
       signOut,
     };
   };
   ```

### Navigation Implementation with Expo Router

The application uses Expo Router with a nested navigation structure that shows bottom tabs only after authentication is completed. The folder structure follows Expo Router v2 conventions with a top-level src directory:

**src/app/\_layout.tsx (Root Layout with Auth Protection)**

```typescript
import { Stack, useSegments, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

// Prevent access to protected routes if not authenticated
function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the sign-in page if not authenticated
      router.replace("/auth");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the home page if authenticated and on auth screens
      router.replace("/(app)");
    }
  }, [isAuthenticated, segments]);
}

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Use the custom hook to protect routes
  useProtectedRoute(isAuthenticated);

  if (isLoading) {
    // Render a loading screen
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ redirect: true }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

**src/app/(app)/\_layout.tsx (Bottom Tabs - Only Shown After Authentication)**

```typescript
import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

export default function AppLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.backdrop,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.surfaceVariant,
          backgroundColor: theme.colors.surface,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{
          title: "Flashcards",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

This navigation structure follows Expo Router's recommended patterns:

1. Using folder names with parentheses like `(app)` to create a group that doesn't affect URL paths
2. Proper route protection using useSegments and useRouter hooks
3. Clear separation between authentication flow and main app content
4. Bottom tabs only available after successful authentication

### Entry Point Implementation

In Expo Router applications, the traditional App.tsx has a minimal role, as the root component logic moves to the layout files in the app directory.

**App.tsx (Minimal Entry Point)**

```typescript
// App.tsx - Minimal entry point
import "expo-router/entry";

// This file imports expo-router/entry which initializes the router
// The actual root component is defined in src/app/_layout.tsx
```

**src/app/\_layout.tsx (Actual Root Component)**

```typescript
import { Stack, useSegments, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { paperTheme } from "@/styles/theme";
import * as SplashScreen from "expo-splash-screen";

// Keep splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

// Prevent access to protected routes if not authenticated
function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the sign-in page if not authenticated
      router.replace("/auth");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the home page if authenticated and on auth screens
      router.replace("/(app)");
    }
  }, [isAuthenticated, segments]);
}

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Use the custom hook to protect routes
  useProtectedRoute(isAuthenticated);

  useEffect(() => {
    // Hide splash screen when the app is ready
    SplashScreen.hideAsync();
  }, []);

  if (isLoading) {
    // Render a loading screen
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ redirect: true }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

According to the [Expo file-based routing documentation](https://docs.expo.dev/develop/file-based-routing/), the first layout file (`_layout.tsx`) inside the app directory is considered to be the single root component in Expo Router applications. It replaces many functions of the traditional App.tsx, including:

1. Defining the root navigation structure
2. Injecting global providers (SafeAreaProvider, PaperProvider)
3. Managing the splash screen
4. Setting up authentication protection
