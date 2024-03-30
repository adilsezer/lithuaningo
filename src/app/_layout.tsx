import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store/store";
import { SessionProvider } from "../context/AuthContext";
import { Slot } from "expo-router";
import { View } from "react-native";
import LoadingIndicator from "@components/LoadingIndicator";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

const RootLayout: React.FC = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { styles: globalStyles } = useThemeStyles();

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        // Assuming you have the Roboto fonts in the specified path
        Roboto: require("assets/fonts/Roboto-Regular.ttf"),
        "Roboto-Bold": require("assets/fonts/Roboto-Bold.ttf"),
      });
      setFontsLoaded(true);
      SplashScreen.hideAsync(); // Hide splash screen once fonts are loaded
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <LoadingIndicator />; // Show loading indicator while fonts are loading
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingIndicator />} persistor={persistor}>
        <SessionProvider>
          <SafeAreaView style={globalStyles.pageStyle}>
            <Slot />
          </SafeAreaView>
        </SessionProvider>
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
