import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@redux/store";
import { Slot } from "expo-router";
import { ThemeProvider } from "@context/ThemeContext";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingIndicator from "@components/ui/LoadingIndicator";
import AuthStateListener from "@providers/AuthStateListener";
import NotificationInitializer from "@providers/NotificationInitializer";
import crashlytics from "@react-native-firebase/crashlytics";
import { useThemeStyles } from "@hooks/useThemeStyles";
import ErrorBoundary from "@components/error/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const InnerRootLayout: React.FC = () => {
  const { styles: globalStyles } = useThemeStyles();

  return (
    <SafeAreaView style={globalStyles.pageStyle}>
      <LoadingIndicator />
      <AuthStateListener />
      <NotificationInitializer />
      <Slot />
    </SafeAreaView>
  );
};

const RootLayout: React.FC = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Roboto: require("assets/fonts/Roboto-Regular.ttf"),
          "Roboto-Bold": require("assets/fonts/Roboto-Bold.ttf"),
          "Roboto-Italic": require("assets/fonts/Roboto-Italic.ttf"),
        });
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      } catch (e) {
        console.error(e);
      }
    }

    loadFonts();
  }, []);

  useEffect(() => {
    crashlytics().log("App mounted.");
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <ErrorBoundary>
            <InnerRootLayout />
          </ErrorBoundary>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
