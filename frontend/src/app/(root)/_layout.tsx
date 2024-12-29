import React from "react";
import { Redirect, Slot } from "expo-router";
import { useAppSelector } from "@redux/hooks";
import { selectIsAuthenticated } from "@redux/slices/userSlice";

const AppLayout: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/dashboard/(tabs)" />;
  }

  return <Slot />;
};

export default AppLayout;
