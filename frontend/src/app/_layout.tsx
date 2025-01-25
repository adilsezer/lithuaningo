import React from "react";
import { Slot } from "expo-router";
import { ThemeProvider } from "@context/ThemeContext";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "@components/ui/LoadingIndicator";
import AuthStateListener from "@providers/AuthStateListener";
import NotificationInitializer from "@providers/NotificationInitializer";
import ErrorBoundary from "@components/error/ErrorBoundary";
import { AppInfoProvider } from "@context/AppInfoContext";
import { useAppLayout } from "@hooks/useAppLayout";

const InnerRootLayout: React.FC = () => {
  const { fontsLoaded, layout } = useAppLayout();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingIndicator modal={false} />
      </View>
    );
  }

  return (
    <SafeAreaView style={layout.page}>
      <LoadingIndicator />
      <AuthStateListener />
      <NotificationInitializer />
      <Slot />
    </SafeAreaView>
  );
};

const RootLayout: React.FC = () => {
  return (
    <AppInfoProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <InnerRootLayout />
        </ErrorBoundary>
      </ThemeProvider>
    </AppInfoProvider>
  );
};

export default RootLayout;
