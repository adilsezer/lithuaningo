import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import AuthStateListener from "@providers/AuthStateListener";
import NotificationInitializer from "@providers/NotificationInitializer";
import ErrorBoundary from "@components/error/ErrorBoundary";
import { AppInfoProvider } from "@context/AppInfoContext";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { ThemeProvider, useTheme } from "@context/ThemeContext";
import { StyleSheet } from "react-native";
import { AlertDialogProvider } from "@components/ui/AlertDialog";
import { createTheme } from "@src/styles/theme";

// Separate component for theme-dependent content
const ThemedContent: React.FC = () => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <LoadingIndicator />
        <AuthStateListener />
        <NotificationInitializer />
        <Slot />
      </SafeAreaView>
    </PaperProvider>
  );
};

// Root layout without any hooks
const RootLayout = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppInfoProvider>
          <AlertDialogProvider>
            <ThemedContent />
          </AlertDialogProvider>
        </AppInfoProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
