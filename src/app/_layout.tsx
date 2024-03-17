// /app/_layout.tsx

import React from "react";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { SessionProvider } from "../context/AuthContext";
import { Slot } from "expo-router";

const RootLayout: React.FC = () => {
  return (
    <Provider store={store}>
      <SessionProvider>
        <Slot />
      </SessionProvider>
    </Provider>
  );
};

export default RootLayout;
