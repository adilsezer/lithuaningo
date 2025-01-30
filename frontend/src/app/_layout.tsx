// src/RootLayout.tsx

import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import AuthInitializer from "@services/initializers/AuthInitializer";
import NotificationInitializer from "@services/initializers/NotificationInitializer";
import ErrorBoundaryProvider from "@providers/ErrorBoundaryProvider";
import { PaperProvider } from "react-native-paper";
import { StyleSheet } from "react-native";
import { AlertDialog } from "@components/AlertDialog";
import { createTheme } from "@src/styles/theme";
import { useIsDarkMode } from "@stores/useThemeStore";
import InitializationProvider from "@providers/InitializationProvider";

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

            {/* Main app content */}
            <Slot />

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
