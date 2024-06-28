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
import auth from "@react-native-firebase/auth";
import { logIn, logOut } from "@src/redux/slices/userSlice";
import { useAppDispatch } from "@src/redux/hooks";

SplashScreen.preventAutoHideAsync();

const RootLayout: React.FC = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const dispatch = useAppDispatch();

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

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user && user.email) {
        dispatch(
          logIn({
            id: user.uid,
            name: user.displayName || "No Name",
            email: user.email,
            emailVerified: user.emailVerified,
          })
        );
      } else {
        dispatch(logOut());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

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
          <Slot />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
