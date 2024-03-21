import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store/store";
import { SessionProvider } from "../context/AuthContext";
import { Slot } from "expo-router";
import { View } from "react-native";
import LoadingIndicator from "@components/LoadingIndicator";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

const RootLayout: React.FC = () => {
  const { styles: globalStyles } = useThemeStyles();
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingIndicator />} persistor={persistor}>
        <SessionProvider>
          <View style={globalStyles.pageStyle}>
            <Slot />
          </View>
        </SessionProvider>
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
