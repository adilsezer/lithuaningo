import { useState, useEffect, useCallback } from "react";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useThemeStyles } from "@hooks/useThemeStyles";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const useAppLayout = () => {
  const { layout } = useThemeStyles();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = useCallback(async () => {
    try {
      await Font.loadAsync({
        Roboto: require("assets/fonts/Roboto-Regular.ttf"),
        "Roboto-Bold": require("assets/fonts/Roboto-Bold.ttf"),
        "Roboto-Italic": require("assets/fonts/Roboto-Italic.ttf"),
      });
      setFontsLoaded(true);
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error("Error loading fonts:", error);
      // Still hide splash screen and set fonts as loaded to not block the app
      setFontsLoaded(true);
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    loadFonts();
  }, [loadFonts]);

  return {
    fontsLoaded,
    layout,
  };
};
