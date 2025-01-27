import React from "react";
import { Slot } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import AuthStateListener from "@providers/AuthStateListener";
import NotificationInitializer from "@providers/NotificationInitializer";
import ErrorBoundary from "@components/error/ErrorBoundary";
import { AppInfoProvider } from "@context/AppInfoContext";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider } from "@context/ThemeContext";
import { StyleSheet } from "react-native";
import { createTheme } from "@src/styles/theme";
const InnerRootLayout: React.FC = () => {
  const theme = createTheme();

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

const RootLayout: React.FC = () => {
  return (
    <ThemeProvider>
      <AppInfoProvider>
        <ErrorBoundary>
          <InnerRootLayout />
        </ErrorBoundary>
      </AppInfoProvider>
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
