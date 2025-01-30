// src/RootLayout.tsx

import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import AuthStateListener from "@providers/AuthStateListener";
import NotificationInitializer from "@providers/NotificationInitializer";
import ErrorBoundaryWithAlert from "@providers/ErrorBoundaryWithAlert";
import { AppInfoProvider } from "@providers/AppInfoProvider";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider } from "@providers/ThemeProvider";
import { StyleSheet } from "react-native";
import { AlertDialog } from "@components/AlertDialog";
import { createTheme } from "@src/styles/theme";
import { useIsDarkMode } from "@stores/useThemeStore";

const ThemedContent = () => {
  const isDarkMode = useIsDarkMode();
  const theme = createTheme(isDarkMode);

  return (
    <PaperProvider theme={theme}>
      <ErrorBoundaryWithAlert>
        <AppInfoProvider>
          <SafeAreaView
            style={[
              styles.container,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <LoadingIndicator />
            <AuthStateListener />
            <NotificationInitializer />
            <Slot />
            <AlertDialog />
          </SafeAreaView>
        </AppInfoProvider>
      </ErrorBoundaryWithAlert>
    </PaperProvider>
  );
};

const RootLayout = () => {
  return (
    <ThemeProvider>
      <ThemedContent />
    </ThemeProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
