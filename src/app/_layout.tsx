import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../redux/store";
import { Slot, Stack } from "expo-router";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingIndicator from "@components/LoadingIndicator";
import AuthStateListener from "@src/components/AuthStateListener"; // Import the AuthStateListener component

SplashScreen.preventAutoHideAsync();

const RootLayout: React.FC = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Roboto: require("assets/fonts/Roboto-Regular.ttf"),
        "Roboto-Bold": require("assets/fonts/Roboto-Bold.ttf"),
      });
      setFontsLoaded(true);
      SplashScreen.hideAsync();
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={globalStyles.fullScreenCenter}>
        <ActivityIndicator size="large" color={globalColors.primary} />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={globalStyles.pageStyle}>
          <LoadingIndicator />
          <AuthStateListener />
          <Slot />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
