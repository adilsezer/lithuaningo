import React from "react";
import { Redirect, Slot } from "expo-router";
import { useRootLayout } from "@hooks/useRootLayout";

const AppLayout: React.FC = () => {
  const { isAuthenticated, redirectPath } = useRootLayout();

  if (isAuthenticated && redirectPath) {
    return <Redirect href={redirectPath} />;
  }

  return <Slot />;
};

export default AppLayout;
