import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import AuthStateListener from "@providers/AuthStateListener";
import NotificationInitializer from "@providers/NotificationInitializer";
import ErrorBoundary from "@components/error/ErrorBoundary";
import { AppInfoProvider } from "@context/AppInfoContext";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider, useTheme } from "@context/ThemeContext";
import { StyleSheet } from "react-native";
import { AlertDialogProvider } from "@components/ui/AlertDialog";
import { createTheme } from "@src/styles/theme";
import { ThemeProp } from "react-native-paper/lib/typescript/types";

// Separate component for theme-dependent content
const ThemedContent = () => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  return (
    <PaperProvider theme={theme}>
      <ErrorBoundary>
        <AppInfoProvider>
          <AlertDialogProvider>
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
            </SafeAreaView>
          </AlertDialogProvider>
        </AppInfoProvider>
      </ErrorBoundary>
    </PaperProvider>
  );
};

// Root layout without any hooks
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
