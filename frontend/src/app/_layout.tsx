// src/RootLayout.tsx

import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
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
import { useUserStore } from "@stores/useUserStore";
import { useIsLoading } from "@stores/useUIStore";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

/**
 * Auth protection hook - redirects based on auth state and current route segment
 */
function useProtectedRoutes() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isVerifyingEmail = useUserStore((state) => state.isVerifyingEmail);
  const isLoading = useIsLoading();

  useEffect(() => {
    if (isLoading || isVerifyingEmail) {
      return;
    }

    const inAuthGroup = segments[0] === "auth";
    const inLegalGroup = segments[0] === "(legal)";

    // If the user is not authenticated, and not in the auth or legal group, redirect them to the auth group.
    if (!isAuthenticated && !inAuthGroup && !inLegalGroup) {
      router.replace("/auth");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [isAuthenticated, segments, isLoading, router, isVerifyingEmail]);
}

const ROOT_SCREENS = [{ name: "index" }, { name: "auth" }, { name: "(app)" }];

const LEGAL_SCREENS = [
  {
    name: "(legal)/terms-of-service" as const,
    options: {
      title: "Terms of Service",
      headerShown: true,
    },
  },
  {
    name: "(legal)/privacy-policy" as const,
    options: {
      title: "Privacy Policy",
      headerShown: true,
    },
  },
];

/**
 * Root layout component that sets up the app's providers and core UI structure.
 * Provider order is important for proper functionality:
 * 1. ErrorBoundaryProvider - Catches all errors
 * 2. PaperProvider - Theme provider for UI components
 * 3. InitializationProvider - Initializes theme and app info
 * 4. Core functionality components (Auth, Notifications)
 */
export default function RootLayout() {
  const isDarkMode = useIsDarkMode();
  const theme = createTheme(isDarkMode);
  const isLoading = useIsLoading();

  // Use auth protection
  useProtectedRoutes();

  // Hide splash screen when initialized
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

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

            {/* Main app navigation stack */}
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: theme.colors.background,
                  paddingHorizontal: 25,
                },
                animation: "none",
              }}
            >
              {ROOT_SCREENS.map((screen) => (
                <Stack.Screen key={screen.name} name={screen.name} />
              ))}
              {LEGAL_SCREENS.map((screen) => (
                <Stack.Screen
                  key={screen.name}
                  name={screen.name}
                  options={screen.options}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
