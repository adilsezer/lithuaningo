// src/RootLayout.tsx

import React from "react";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import AuthInitializer from "@services/initializers/AuthInitializer";
import NotificationInitializer from "@services/initializers/NotificationInitializer";
import ErrorBoundaryProvider from "@providers/ErrorBoundaryProvider";
import { PaperProvider } from "react-native-paper";
import { StyleSheet } from "react-native";
import { AlertDialog } from "@components/ui/AlertDialog";
import { createTheme } from "@src/styles/theme";
import { useIsDarkMode } from "@stores/useThemeStore";
import InitializationProvider from "@providers/InitializationProvider";

// Define all app routes based on the file system structure
const APP_ROUTES = [
  "(root)",
  "dashboard/(tabs)",
  "decks/new",
  "decks/[id]/comments",
  "decks/[id]/edit",
  "decks/[id]/index",
  "decks/[id]/quiz",
  "decks/[id]/report",
  "flashcards/new",
  "flashcards/[id]/edit",
  "learning/[wordId]",
  "learning/quiz",
  "auth/login",
  "auth/signup",
  "auth/forgot-password",
  "profile/change-password",
  "profile/delete-account",
  "profile/edit-profile",
  "profile/settings",
  "about/index",
  "privacy-policy/index",
  "terms-of-service/index",
  "notification/index",
] as const;

/**
 * Root layout component that sets up the app's providers and core UI structure.
 * Provider order is important for proper functionality:
 * 1. ErrorBoundaryProvider - Catches all errors
 * 2. PaperProvider - Theme provider for UI components
 * 3. InitializationProvider - Initializes theme and app info
 * 4. Core functionality components (Auth, Notifications)
 */
const RootLayout = () => {
  const isDarkMode = useIsDarkMode();
  const theme = createTheme(isDarkMode);

  return (
    <PaperProvider theme={theme}>
      <ErrorBoundaryProvider>
        <InitializationProvider>
          <SafeAreaView
            style={[
              styles.container,
              { backgroundColor: theme.colors.background },
            ]}
          >
            {/* Core functionality components */}
            <LoadingIndicator />
            <AuthInitializer />
            <NotificationInitializer />

            {/* Main app content with Stack navigation */}
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: theme.colors.background,
                },
                animation: "none",
              }}
            >
              {APP_ROUTES.map((route) => (
                <Stack.Screen
                  key={route}
                  name={route}
                  options={{
                    headerShown: false,
                  }}
                />
              ))}
            </Stack>

            {/* Global UI components */}
            <AlertDialog />
          </SafeAreaView>
        </InitializationProvider>
      </ErrorBoundaryProvider>
    </PaperProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
